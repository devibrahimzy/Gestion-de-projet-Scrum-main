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
        const { project_id, name, start_date, end_date, planned_velocity } = req.body;

        if (!project_id || !name) {
            return res.status(400).json({ message: "Project ID and Name are required" });
        }

        const allowed = await isScrumMaster(project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can create sprint" });
        }

        const sprint = {
            id: uuid(),
            project_id,
            name,
            start_date,
            end_date,
            status: "PLANNING",
            planned_velocity,
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

