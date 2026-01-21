const Sprint = require("../models/sprint.model");
const Project = require("../models/project.model");
const BacklogItem = require("../models/backlog.model");
const { v4: uuid } = require("uuid");


const isScrumMaster = async (projectId, userId) => {
    const [rows] = await Project.isScrumMaster(projectId, userId);
    return rows.length > 0;
};
exports.getSprintsByProject = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID is required" });

        const [sprints] = await Sprint.findAllByProject(projectId);
        res.json(sprints);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving sprints", error: err.message });
    }
};

exports.getActiveSprint = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID is required" });

        const [sprints] = await Sprint.findAllByProject(projectId);
        const activeSprint = sprints.find(s => s.status === 'ACTIVE');

        if (!activeSprint) {
            return res.status(404).json({ message: "No active sprint found" });
        }

        // Get items
        const [items] = await BacklogItem.findAllBySprint(activeSprint.id);

        // Calculate capacity metrics
        const totalCapacity = activeSprint.planned_velocity;
        const completedPoints = items.filter(i => i.status === 'DONE').reduce((sum, i) => sum + (i.story_points || 0), 0);
        const remainingPoints = totalCapacity - completedPoints;
        const progressPercentage = totalCapacity > 0 ? Math.round((completedPoints / totalCapacity) * 100) : 0;

        res.json({
            sprint: activeSprint,
            items,
            capacity: {
                total: totalCapacity,
                completed: completedPoints,
                remaining: remainingPoints,
                progress_percentage: progressPercentage
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving active sprint", error: err.message });
    }
};

exports.createSprint = async (req, res) => {
    try {
        const { project_id, name, objective, start_date, end_date, planned_velocity } = req.body;

        if (!project_id || !name) {
            return res.status(400).json({ message: "Project ID and Name are required" });
        }

        const allowed = await isScrumMaster(project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can create sprint" });
        }

        // Calculate planned velocity if not provided
        let finalVelocity = planned_velocity;
        if (!finalVelocity) {
            const [avgResult] = await Sprint.getAverageVelocity(project_id);
            finalVelocity = avgResult[0].avg_velocity ? Math.round(avgResult[0].avg_velocity) : 0;
        }

        const sprint = {
            id: uuid(),
            project_id,
            name,
            objective,
            start_date,
            end_date,
            status: "PLANNING",
            planned_velocity: finalVelocity,
            isActive: 1
        };

        await Sprint.create(sprint);
        res.status(201).json(sprint);
    } catch (err) {
        res.status(500).json({ message: "Error creating sprint", error: err.message });
    }
};


exports.updateSprint = async (req, res) => {
    try {
        await Sprint.updatePartial(req.params.id, req.body);
        res.json({ message: "Sprint updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating sprint", error: err.message });
    }
};
exports.activateSprint = async (req, res) => {
    try {
        const sprintId = req.params.id;

        // Récupérer sprint
        const [rows] = await Sprint.findById(sprintId);
        if (!rows.length) return res.status(404).json({ message: "Sprint not found" });

        const sprint = rows[0];

        // Vérifier Scrum Master
        const allowed = await isScrumMaster(sprint.project_id, req.user.id);
        if (!allowed) return res.status(403).json({ message: "Only Scrum Master can activate sprint" });

        // Vérifier si un autre sprint est déjà actif
        const [activeSprints] = await Sprint.findAllByProject(sprint.project_id);
        if (activeSprints.some(s => s.status === 'ACTIVE')) {
            return res.status(400).json({ message: "Another sprint is already active for this project" });
        }

        // Passer le sprint à ACTIVE
        await Sprint.updateStatus(sprintId, 'ACTIVE');

        // Update project status to ACTIVE
        await Project.update(sprint.project_id, { status: 'ACTIVE' });

        // Record initial burndown data
        const [remaining] = await Sprint.calculateRemainingPoints(sprintId);
        await Sprint.recordBurndownData(sprintId, new Date().toISOString().split('T')[0], remaining[0].remaining || 0);

        res.json({ message: "Sprint activated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error activating sprint", error: err.message });
    }
};


exports.completeSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const { unfinished_action } = req.body; // 'backlog' or 'next_sprint'

        // Check Scrum Master
        const [sprintRows] = await Sprint.findById(id);
        if (!sprintRows.length) return res.status(404).json({ message: "Sprint not found" });
        const sprint = sprintRows[0];

        const allowed = await isScrumMaster(sprint.project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can complete sprint" });
        }

        // 1. Get unfinished items
        const [items] = await BacklogItem.findAllBySprint(id);
        const unfinished = items.filter(item => item.status !== 'DONE');

        // 2. Handle unfinished items
        if (unfinished.length > 0) {
            if (unfinished_action === 'backlog') {
                // Move to backlog
                for (const item of unfinished) {
                    await BacklogItem.update(item.id, {
                        sprint_id: null,
                        status: 'BACKLOG',
                        position: 0
                    });
                }
            } else if (unfinished_action === 'next_sprint') {
                // Keep in sprint for next one (status remains)
            } else {
                return res.status(400).json({
                    message: "Unfinished items found. Specify action: 'backlog' or 'next_sprint'",
                    unfinished_items: unfinished.map(u => ({ id: u.id, title: u.title }))
                });
            }
        }

        // 3. Calculate actual velocity
        const [result] = await BacklogItem.sumStoryPointsBySprint(id);
        const velocity = result[0].total || 0;

        // 4. Update sprint status
        await Sprint.updatePartial(id, {
            status: 'COMPLETED',
            actual_velocity: velocity,
            isActive: 0
        });

        // 5. Update project status back to PLANNING
        await Project.update(sprint.project_id, { status: 'PLANNING' });

        res.json({
            message: "Sprint completed successfully",
            actual_velocity: velocity,
            unfinished_handled: unfinished_action || 'none',
            unfinished_count: unfinished.length
        });
    } catch (err) {
        res.status(500).json({ message: "Error completing sprint", error: err.message });
    }
};

exports.deleteSprint = async (req, res) => {
    try {
        const sprintId = req.params.id;

        const [rows] = await Sprint.findById(sprintId);
        if (!rows.length) {
            return res.status(404).json({ message: "Sprint not found" });
        }

        const sprint = rows[0];

        const allowed = await isScrumMaster(sprint.project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can delete sprint" });
        }

        const affectedRows = await Sprint.softDelete(sprintId);

        if (affectedRows === 0) {
            return res.status(400).json({
                message: "Sprint already deleted or not found"
            });
        }

        res.json({ message: "Sprint soft-deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting sprint", error: err.message });
    }
};

exports.moveItemToSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const { itemId } = req.body;

        const [sprintRows] = await Sprint.findById(sprintId);
        if (!sprintRows.length) return res.status(404).json({ message: "Sprint not found" });
        const sprint = sprintRows[0];

        const allowed = await isScrumMaster(sprint.project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can manage sprint items" });
        }

        const [itemRows] = await BacklogItem.findById(itemId);
        if (!itemRows.length) return res.status(404).json({ message: "Item not found" });
        const item = itemRows[0];

        if (item.sprint_id) {
            return res.status(400).json({ message: "Item already assigned to a sprint" });
        }

        // Check capacity
        const [sprintItems] = await BacklogItem.findAllBySprint(sprintId);
        const currentPoints = sprintItems.reduce((sum, i) => sum + (i.story_points || 0), 0);
        const newTotal = currentPoints + (item.story_points || 0);

        let warning = null;
        if (newTotal > sprint.planned_velocity) {
            warning = `Adding this item will exceed sprint capacity (${newTotal}/${sprint.planned_velocity} story points)`;
        }

        // Move item
        const position = sprintItems.length + 1;
        await BacklogItem.update(itemId, {
            sprint_id: sprintId,
            status: 'TODO',
            position
        });

        // Record burndown data
        const [remaining] = await Sprint.calculateRemainingPoints(sprintId);
        await Sprint.recordBurndownData(sprintId, new Date().toISOString().split('T')[0], remaining[0].remaining || 0);

        res.json({
            sprint: sprint,
            ideal_line: idealLine,
            actual_line: burndownData
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving burndown chart", error: err.message });
    }
};

exports.getVelocityChart = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID required" });

        // Check member
        const [member] = await BacklogItem.isMember(projectId, req.user.id);
        if (member.length === 0) return res.status(403).json({ message: "Not a member" });

        const [sprints] = await db.query(
            "SELECT name, start_date, planned_velocity, actual_velocity FROM sprints WHERE project_id = ? AND status = 'COMPLETED' ORDER BY start_date",
            [projectId]
        );

        // Calculate moving average (last 3 sprints)
        const velocities = sprints.map(s => s.actual_velocity || 0);
        const movingAverage = [];
        for (let i = 0; i < velocities.length; i++) {
            const start = Math.max(0, i - 2);
            const slice = velocities.slice(start, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            movingAverage.push(Math.round(avg));
        }

        res.json({
            sprints: sprints,
            moving_average: movingAverage
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving velocity chart", error: err.message });
    }
};

exports.removeItemFromSprint = async (req, res) => {
    try {
        const { sprintId, itemId } = req.params;

        const [sprintRows] = await Sprint.findById(sprintId);
        if (!sprintRows.length) return res.status(404).json({ message: "Sprint not found" });
        const sprint = sprintRows[0];

        // Check if member of project
        const [member] = await BacklogItem.isMember(sprint.project_id, req.user.id);
        if (member.length === 0) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const [itemRows] = await BacklogItem.findById(itemId);
        if (!itemRows.length) return res.status(404).json({ message: "Item not found" });
        const item = itemRows[0];

        if (item.sprint_id !== sprintId) {
            return res.status(400).json({ message: "Item not in this sprint" });
        }

        // Remove from sprint
        await BacklogItem.update(itemId, {
            sprint_id: null,
            status: 'BACKLOG',
            position: 0
        });

        // Reorder remaining items
        await BacklogItem.removeFromColumn(sprintId, 'TODO', item.position);

        // Record burndown data
        const [remaining] = await Sprint.calculateRemainingPoints(sprintId);
        await Sprint.recordBurndownData(sprintId, new Date().toISOString().split('T')[0], remaining[0].remaining || 0);

        res.json({ message: "Item removed from sprint" });
    } catch (err) {
        res.status(500).json({ message: "Error removing item", error: err.message });
    }
};

exports.getBurndownChart = async (req, res) => {
    try {
        const { id } = req.params;

        const [sprintRows] = await Sprint.findById(id);
        if (!sprintRows.length) return res.status(404).json({ message: "Sprint not found" });
        const sprint = sprintRows[0];

        // Check if member
        const [member] = await BacklogItem.isMember(sprint.project_id, req.user.id);
        if (member.length === 0) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const [burndownData] = await Sprint.getBurndownData(id);

        // Calculate ideal line
        const startDate = new Date(sprint.start_date);
        const endDate = new Date(sprint.end_date);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const idealDailyBurn = sprint.planned_velocity / (totalDays - 1); // Exclude start day

        const idealLine = [];
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const remaining = Math.max(0, sprint.planned_velocity - (idealDailyBurn * i));
            idealLine.push({
                date: date.toISOString().split('T')[0],
                remaining_story_points: Math.round(remaining)
            });
        }

        res.json({
            sprint: {
                id: sprint.id,
                name: sprint.name,
                start_date: sprint.start_date,
                end_date: sprint.end_date,
                planned_velocity: sprint.planned_velocity
            },
            ideal_line: idealLine,
            actual_line: burndownData
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving burndown chart", error: err.message });
    }
};

