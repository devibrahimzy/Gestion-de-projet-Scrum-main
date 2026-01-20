const BacklogItem = require("../models/backlog.model");
const { v4: uuid } = require("uuid");

exports.getBacklogByProject = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID is required" });

        const [items] = await BacklogItem.findAllByProject(projectId);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving backlog", error: err.message });
    }
};

exports.getBacklogBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const [items] = await BacklogItem.findAllBySprint(sprintId);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving sprint items", error: err.message });
    }
};

exports.getBacklogItemById = async (req, res) => {
    try {
        const [rows] = await BacklogItem.findById(req.params.id);
        if (rows.length === 0) return res.status(404).json({ message: "Item not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving item", error: err.message });
    }
};

exports.createBacklogItem = async (req, res) => {
    try {
        const { project_id, sprint_id, title, description, type, story_points, priority, assigned_to_id } = req.body;

        if (!project_id || !title) return res.status(400).json({ message: "Project ID and Title are required" });

        // Si on assigne à un sprint, vérifier que le sprint n'est pas complété
        if (sprint_id) {
            const Sprint = require("../models/sprint.model");
            const [sprintRows] = await Sprint.findById(sprint_id);

            if (!sprintRows.length) {
                return res.status(404).json({ message: "Sprint not found" });
            }

            const sprint = sprintRows[0];
            if (sprint.status === 'COMPLETED') {
                return res.status(400).json({ message: "Cannot assign items to a completed sprint" });
            }
        }

        let position = 0;
        let finalStatus = 'BACKLOG';

        if (sprint_id) {
            finalStatus = 'TODO'; // If assigned to a sprint immediately
            const [[{ maxPos }]] = await BacklogItem.getMaxPosition(sprint_id, finalStatus);
            position = (maxPos || 0) + 1;
        }

        const newItem = {
            id: uuid(),
            project_id,
            sprint_id: sprint_id || null,
            title,
            description,
            type: type || 'USER_STORY',
            story_points: story_points || 0,
            priority: priority || 0,
            status: finalStatus,
            position,
            assigned_to_id: assigned_to_id || null,
            created_by_id: req.user ? req.user.id : null
        };

        await BacklogItem.create(newItem);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error creating backlog item", error: err.message });
    }
};

exports.updateBacklogItem = async (req, res) => {
    try {
        // ... (same logic as before)
        await BacklogItem.update(req.params.id, req.body);
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating item", error: err.message });
    }
};

exports.assignMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const [items] = await BacklogItem.findById(id);
        if (items.length === 0) return res.status(404).json({ message: "Item not found" });
        const item = items[0];

        if (userId) {
            const [member] = await BacklogItem.isMember(item.project_id, userId);
            if (member.length === 0) {
                return res.status(400).json({ message: "User is not a member of this project" });
            }
        }

        await BacklogItem.update(id, { assigned_to_id: userId || null });
        res.json({ message: "Member assigned successfully", assigned_to_id: userId });
    } catch (err) {
        res.status(500).json({ message: "Error assigning member", error: err.message });
    }
};

exports.deleteBacklogItem = async (req, res) => {
    try {
        await BacklogItem.softDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item", error: err.message });
    }
};
