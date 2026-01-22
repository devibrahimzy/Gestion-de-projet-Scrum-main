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

        // Get custom columns
        const [columns] = await db.query(
            "SELECT * FROM kanban_columns WHERE project_id = ? ORDER BY position",
            [projectId]
        );

        // If no columns, use default status mapping
        const boardColumns = columns.length > 0 ? columns : [
            { name: 'To-Do', status: 'TODO' },
            { name: 'In Progress', status: 'IN_PROGRESS' },
            { name: 'Done', status: 'DONE' }
        ];

        const { assigned_to_id, type, priority, tags } = req.query;
        const filters = { 
            assigned_to_id: assigned_to_id === 'null' ? null : assigned_to_id, 
            type, 
            priority, 
            tags 
        };
        const [items] = await BacklogItem.findAllBySprint(sprintId, filters);

        // Enhance items with card details
        const enhancedItems = await Promise.all(items.map(async (item) => {
            // Get comment count
            const [comments] = await db.query("SELECT COUNT(*) as count FROM backlog_item_comments WHERE backlog_item_id = ?", [item.id]);
            const commentCount = comments[0].count;

            // Get assigned user info
            let assignedUser = null;
            if (item.assigned_to_id) {
                const [users] = await db.query("SELECT first_name, last_name, profile_photo FROM users WHERE id = ?", [item.assigned_to_id]);
                if (users.length > 0) {
                    assignedUser = users[0];
                }
            }

            // Check if overdue
            const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'DONE';

            return {
                ...item,
                unique_id: `${item.project_id.substring(0, 4).toUpperCase()}-${item.id.substring(0, 3).toUpperCase()}`,
                tags: item.tags ? JSON.parse(item.tags) : [],
                comment_count: commentCount,
                assigned_user: assignedUser,
                is_overdue: isOverdue,
                is_blocked: item.is_blocked
            };
        }));

        // Group items by column
        const board = boardColumns.map(col => ({
            ...col,
            items: enhancedItems.filter(item => item.status === (col.status || col.name.replace(' ', '_').toUpperCase())),
            item_count: 0 // Will calculate
        }));

        board.forEach(col => {
            col.item_count = col.items.length;
            // Check WIP limit
            if (col.wip_limit && col.item_count > col.wip_limit) {
                col.warning = `WIP limit exceeded (${col.item_count}/${col.wip_limit})`;
            }
        });

        res.json({ columns: board, total_items: enhancedItems.length });
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

        // Record movement history
        await connection.query(
            "INSERT INTO backlog_history (id, backlog_item_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [uuid(), id, req.user.id, 'MOVED', 'status', fromStatus, finalStatus]
        );

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

// Column management
exports.getKanbanColumns = async (req, res) => {
    try {
        const { projectId } = req.params;

        const [member] = await BacklogItem.isMember(projectId, req.user.id);
        if (member.length === 0) return res.status(403).json({ message: "Unauthorized" });

        const [columns] = await db.query(
            "SELECT * FROM kanban_columns WHERE project_id = ? ORDER BY position",
            [projectId]
        );

        res.json(columns);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving columns", error: err.message });
    }
};

exports.addKanbanColumn = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, wip_limit } = req.body;

        const [member] = await BacklogItem.isMember(projectId, req.user.id);
        if (member.length === 0 || member[0].role !== 'PRODUCT_OWNER') {
            return res.status(403).json({ message: "Only Product Owner can manage columns" });
        }

        const [[{ maxPos }]] = await db.query(
            "SELECT MAX(position) as maxPos FROM kanban_columns WHERE project_id = ?",
            [projectId]
        );

        await db.query(
            "INSERT INTO kanban_columns (id, project_id, name, position, wip_limit) VALUES (?, ?, ?, ?, ?)",
            [uuid(), projectId, name, (maxPos || 0) + 1, wip_limit || null]
        );

        res.status(201).json({ message: "Column added" });
    } catch (err) {
        res.status(500).json({ message: "Error adding column", error: err.message });
    }
};

exports.updateKanbanColumn = async (req, res) => {
    try {
        const { columnId } = req.params;
        const { name, wip_limit } = req.body;

        // Check if column has items
        const [[{ count }]] = await db.query(
            "SELECT COUNT(*) as count FROM backlog_items bi JOIN kanban_columns kc ON bi.status = REPLACE(UPPER(kc.name), ' ', '_') WHERE kc.id = ?",
            [columnId]
        );

        if (count > 0) {
            return res.status(400).json({ message: "Cannot modify column with items" });
        }

        await db.query(
            "UPDATE kanban_columns SET name = ?, wip_limit = ? WHERE id = ?",
            [name, wip_limit, columnId]
        );

        res.json({ message: "Column updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating column", error: err.message });
    }
};

exports.deleteKanbanColumn = async (req, res) => {
    try {
        const { columnId } = req.params;

        // Check if column has items
        const [[{ count }]] = await db.query(
            "SELECT COUNT(*) as count FROM backlog_items bi JOIN kanban_columns kc ON bi.status = REPLACE(UPPER(kc.name), ' ', '_') WHERE kc.id = ?",
            [columnId]
        );

        if (count > 0) {
            return res.status(400).json({ message: "Cannot delete column with items" });
        }

        await db.query("DELETE FROM kanban_columns WHERE id = ?", [columnId]);
        res.json({ message: "Column deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting column", error: err.message });
    }
};
