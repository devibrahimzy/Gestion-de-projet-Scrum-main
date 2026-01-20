const BacklogItem = require("../models/backlog.model");
const Sprint = require("../models/sprint.model");
const { v4: uuid } = require("uuid");
const db = require("../config/database");

exports.getKanbanBoard = async (req, res) => {
    try {
        const { sprintId } = req.params;

        // Fetch project_id from sprint
        const [sprints] = await Sprint.findById(sprintId);
        if (sprints.length === 0) return res.status(404).json({ message: "Sprint not found" });
        const projectId = sprints[0].project_id;

        // Check membership
        const [member] = await BacklogItem.isMember(projectId, req.user.id);
        if (member.length === 0) return res.status(403).json({ message: "Unauthorized: You are not a member of this project" });

        const { assigned_to_id, type } = req.query;
        const [items] = await BacklogItem.findAllBySprint(sprintId, { assigned_to_id, type });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving Kanban board", error: err.message });
    }
};



exports.moveKanbanItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const toStatus = req.body.toStatus || req.body.status;
        const toPosition = req.body.toPosition !== undefined ? req.body.toPosition : req.body.position;
        const toSprintId = req.body.toSprintId || req.body.sprint_id;

        console.log(`DEBUG: Moving item ${id}`, { toStatus, toPosition, toSprintId, body: req.body });

        const [items] = await connection.query("SELECT * FROM backlog_items WHERE id = ?", [id]);
        if (items.length === 0) throw new Error("Item not found");
        const item = items[0];

        // 1. Check membership
        const [member] = await connection.query(
            "SELECT * FROM project_members WHERE project_id = ? AND user_id = ?",
            [item.project_id, req.user.id]
        );
        if (member.length === 0) throw new Error("Unauthorized: You are not a member of this project");

        // 2. Check source sprint
        const [sprints] = await connection.query("SELECT * FROM sprints WHERE id = ?", [item.sprint_id]);
        if (sprints.length > 0 && sprints[0].status === 'COMPLETED') {
            throw new Error("Cannot move items from a completed sprint");
        }

        // 3. Check target sprint (if different)
        if (toSprintId && toSprintId !== item.sprint_id) {
            const [newSprints] = await connection.query("SELECT * FROM sprints WHERE id = ?", [toSprintId]);
            if (newSprints.length > 0 && newSprints[0].status === 'COMPLETED') {
                throw new Error("Cannot move items to a completed sprint");
            }
        }

        const fromStatus = item.status;
        const fromPos = item.position;
        const finalSprintId = toSprintId || item.sprint_id;
        const finalStatus = toStatus || fromStatus || 'TODO';
        const finalPosition = (toPosition !== undefined && toPosition !== null) ? Number(toPosition) : (fromPos || 0);

        console.log(`DEBUG: Final values: status=${finalStatus}, position=${finalPosition}, sprint=${finalSprintId}`);

        if (fromStatus === finalStatus && item.sprint_id === finalSprintId) {
            // Same column reorder
            if (fromPos < finalPosition) {
                await connection.query(
                    "UPDATE backlog_items SET position = COALESCE(position, 0) - 1 WHERE sprint_id = ? AND status = ? AND position > ? AND position <= ?",
                    [finalSprintId, finalStatus, fromPos, finalPosition]
                );
            } else if (fromPos > finalPosition) {
                await connection.query(
                    "UPDATE backlog_items SET position = COALESCE(position, 0) + 1 WHERE sprint_id = ? AND status = ? AND position >= ? AND position < ?",
                    [finalSprintId, finalStatus, finalPosition, fromPos]
                );
            }
        } else {
            // Different column or different sprint
            // 1. Remove from old column
            await connection.query(
                "UPDATE backlog_items SET position = COALESCE(position, 0) - 1 WHERE sprint_id = ? AND status = ? AND position > ?",
                [item.sprint_id, fromStatus, fromPos]
            );

            // 2. Shift items in new column
            await connection.query(
                "UPDATE backlog_items SET position = COALESCE(position, 0) + 1 WHERE sprint_id = ? AND status = ? AND position >= ?",
                [finalSprintId, finalStatus, finalPosition]
            );
        }

        // 3. Update the item itself
        let timestampUpdate = "";
        const updateParams = [finalStatus, finalPosition, finalSprintId];

        if (finalStatus === 'IN_PROGRESS' && !item.started_at) {
            timestampUpdate = ", started_at = CURRENT_TIMESTAMP";
        } else if (finalStatus === 'DONE') {
            timestampUpdate = ", completed_at = CURRENT_TIMESTAMP";
        } else if (fromStatus === 'DONE' && finalStatus !== 'DONE') {
            // If moved back from DONE, clear completed_at
            timestampUpdate = ", completed_at = NULL";
        }

        const [updateResult] = await connection.query(
            `UPDATE backlog_items SET status = ?, position = ?, sprint_id = ? ${timestampUpdate} WHERE id = ?`,
            [...updateParams, id]
        );
        console.log(`DEBUG: Update result rows: ${updateResult.affectedRows}`);

        await connection.commit();

        const [updatedRows] = await connection.query("SELECT * FROM backlog_items WHERE id = ?", [id]);
        res.json({ message: "Item moved successfully", item: updatedRows[0] });
    } catch (err) {
        await connection.rollback();
        console.error("DEBUG ERROR:", err.message);
        res.status(500).json({ message: "Error moving item", error: err.message });
    } finally {
        connection.release();
    }
};
