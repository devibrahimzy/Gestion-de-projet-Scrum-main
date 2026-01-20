const Retro = require("../models/retrospective.model");
const { v4: uuid } = require("uuid");

exports.getRetroBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const [rows] = await Retro.findBySprintId(sprintId);
        if (rows.length === 0) return res.json(null); // No retro yet

        const retro = rows[0];
        const [items] = await Retro.findItemsByRetroId(retro.id);

        res.json({ ...retro, items });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving retrospective", error: err.message });
    }
};

exports.createRetrospective = async (req, res) => {
    try {
        const { sprint_id, date, facilitator_id } = req.body;

        // Check if exists
        const [existing] = await Retro.findBySprintId(sprint_id);
        if (existing.length > 0) return res.status(400).json({ message: "Retrospective already exists for this sprint" });

        const newRetro = {
            id: uuid(),
            sprint_id,
            date,
            status: 'DRAFT',
            facilitator_id: facilitator_id || req.user?.id
        };

        await Retro.createRetro(newRetro);
        res.status(201).json(newRetro);
    } catch (err) {
        res.status(500).json({ message: "Error creating retrospective", error: err.message });
    }
};

exports.addItem = async (req, res) => {
    try {
        const { retrospective_id, category, text } = req.body;
        const newItem = {
            id: uuid(),
            retrospective_id,
            category,
            text,
            author_id: req.user?.id
        };

        await Retro.createItem(newItem);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error adding item", error: err.message });
    }
};

exports.publishRetrospective = async (req, res) => {
    try {
        const { id } = req.params;
        await Retro.updateRetroStatus(id, 'PUBLISHED');
        res.json({ message: "Retrospective published successfully", status: 'PUBLISHED' });
    } catch (err) {
        res.status(500).json({ message: "Error publishing retrospective", error: err.message });
    }
};

exports.voteItem = async (req, res) => {
    try {
        await Retro.voteItem(req.params.id);
        res.json({ message: "Vote recorded" });
    } catch (err) {
        res.status(500).json({ message: "Error voting", error: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await Retro.deleteItem(req.params.id);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item", error: err.message });
    }
};

exports.getRetrosByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [rows] = await Retro.findAllByProject(projectId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching project retrospectives", error: err.message });
    }
};

exports.getTrends = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [rows] = await Retro.getTrendData(projectId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching trends", error: err.message });
    }
};

exports.updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body;
        const [result] = await Retro.updateItemStatus(id, is_completed);
        res.json({
            message: "Action item status updated",
            is_completed,
            affectedRows: result.affectedRows
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating action item", error: err.message });
    }
};
