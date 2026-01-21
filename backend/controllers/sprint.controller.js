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

        res.json({ message: "Sprint activated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error activating sprint", error: err.message });
    }
};


exports.completeSprint = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check if all items are DONE
        const [items] = await BacklogItem.findAllBySprint(id);
        const unfinished = items.filter(item => item.status !== 'DONE');
        if (unfinished.length > 0) {
            return res.status(400).json({
                message: "Cannot complete sprint: some items are not DONE",
                unfinishedItems: unfinished.map(u => u.title)
            });
        }

        // 2. Calculate actual velocity
        const [result] = await BacklogItem.sumStoryPointsBySprint(id);
        const velocity = result[0].total || 0;

        // 3. Update sprint status
        await Sprint.updatePartial(id, {
            status: 'COMPLETED',
            actual_velocity: velocity,
            isActive: 0 // Optional: archive sprint on completion
        });

        res.json({ message: "Sprint completed successfully", actual_velocity: velocity });
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

        res.json({
            message: "Item moved to sprint",
            remaining_capacity: sprint.planned_velocity - newTotal,
            warning
        });
    } catch (err) {
        res.status(500).json({ message: "Error moving item", error: err.message });
    }
};

exports.removeItemFromSprint = async (req, res) => {
    try {
        const { sprintId, itemId } = req.params;

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

        res.json({ message: "Item removed from sprint" });
    } catch (err) {
        res.status(500).json({ message: "Error removing item", error: err.message });
    }
};

