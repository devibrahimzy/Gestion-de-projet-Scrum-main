const db = require("../config/database");

exports.findAllByProject = (projectId, filters = {}) => {
    let sql = "SELECT * FROM backlog_items WHERE project_id = ? AND isActive = 1";
    const params = [projectId];

    if (filters.status) {
        sql += " AND status = ?";
        params.push(filters.status);
    }
    if (filters.priority) {
        sql += " AND priority = ?";
        params.push(filters.priority);
    }
    if (filters.type) {
        sql += " AND type = ?";
        params.push(filters.type);
    }
    if (filters.assigned_to) {
        sql += " AND assigned_to_id = ?";
        params.push(filters.assigned_to);
    }
    if (filters.tags) {
        sql += " AND JSON_CONTAINS(tags, JSON_QUOTE(?))";
        params.push(filters.tags);
    }

    let orderBy = "position ASC, priority DESC, created_at ASC";
    if (filters.sort === 'created_at') {
        orderBy = "created_at DESC";
    } else if (filters.sort === 'title') {
        orderBy = "title ASC";
    } else if (filters.sort === 'story_points') {
        orderBy = "story_points ASC";
    } else if (filters.sort === 'status') {
        orderBy = "status ASC";
    } else if (filters.sort === 'priority') {
        orderBy = "priority DESC";
    }

    sql += ` ORDER BY ${orderBy}`;

    return db.query(sql, params);
};

exports.getMaxBacklogPosition = (projectId) => {
    return db.query(
        "SELECT MAX(position) as maxPos FROM backlog_items WHERE project_id = ? AND sprint_id IS NULL AND isActive = 1",
        [projectId]
    );
};

exports.reorderBacklog = (projectId, itemId, newPosition) => {
    // Get current position
    const getCurrent = db.query("SELECT position FROM backlog_items WHERE id = ?", [itemId]);
    return getCurrent.then(([currentRows]) => {
        const currentPos = currentRows[0].position;
        if (currentPos === newPosition) return Promise.resolve();

        if (currentPos < newPosition) {
            // Moving down: shift items up
            return db.query(
                "UPDATE backlog_items SET position = position - 1 WHERE project_id = ? AND sprint_id IS NULL AND isActive = 1 AND position > ? AND position <= ?",
                [projectId, currentPos, newPosition]
            ).then(() => {
                return db.query("UPDATE backlog_items SET position = ? WHERE id = ?", [newPosition, itemId]);
            });
        } else {
            // Moving up: shift items down
            return db.query(
                "UPDATE backlog_items SET position = position + 1 WHERE project_id = ? AND sprint_id IS NULL AND isActive = 1 AND position >= ? AND position < ?",
                [projectId, newPosition, currentPos]
            ).then(() => {
                return db.query("UPDATE backlog_items SET position = ? WHERE id = ?", [newPosition, itemId]);
            });
        }
    });
};

exports.findById = (id) => {
    return db.query("SELECT * FROM backlog_items WHERE id = ?", [id]);
};

exports.findAllBySprint = (sprintId, filters = {}) => {
    let sql = "SELECT * FROM backlog_items WHERE sprint_id = ? AND isActive = 1";
    const params = [sprintId];

    if (filters.assigned_to_id) {
        sql += " AND assigned_to_id = ?";
        params.push(filters.assigned_to_id);
    }

    if (filters.type) {
        sql += " AND type = ?";
        params.push(filters.type);
    }

    sql += " ORDER BY status, position ASC";
    return db.query(sql, params);
};

exports.getMaxPosition = (sprintId, status) => {
    return db.query(
        "SELECT MAX(position) as maxPos FROM backlog_items WHERE sprint_id = ? AND status = ?",
        [sprintId, status]
    );
};

exports.create = (item) => {
    const { id, project_id, sprint_id, title, description, type, story_points, priority, tags, status, position, assigned_to_id, created_by_id } = item;
    return db.query(
        "INSERT INTO backlog_items (id, project_id, sprint_id, title, description, type, story_points, priority, tags, status, position, assigned_to_id, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, project_id, sprint_id, title, description, type || 'USER_STORY', story_points || 0, priority || 'MEDIUM', tags ? JSON.stringify(tags) : null, status || 'BACKLOG', position || 0, assigned_to_id, created_by_id]
    );
};

exports.update = (id, data, userId) => {
    const fields = [];
    const values = [];

    // Get current item for logging
    const currentPromise = db.query("SELECT * FROM backlog_items WHERE id = ?", [id]);

    for (const key in data) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(key === 'tags' ? JSON.stringify(data[key]) : data[key]);
        }
    }

    if (!fields.length) return Promise.resolve();

    values.push(id);

    const updatePromise = db.query(
        `UPDATE backlog_items SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
    );

    return Promise.all([currentPromise, updatePromise]).then(([currentResult, updateResult]) => {
        const [currentRows] = currentResult;
        if (currentRows.length > 0 && userId) {
            const current = currentRows[0];
            for (const key in data) {
                if (data[key] !== undefined && JSON.stringify(data[key]) !== JSON.stringify(current[key])) {
                    exports.logChange(id, userId, 'UPDATE', key, current[key], data[key]);
                }
            }
        }
        return updateResult;
    });
};


exports.updateStatus = (id, status) => {
    return db.query("UPDATE backlog_items SET status = ? WHERE id = ?", [status, id]);
};

exports.softDelete = (id) => {
    return db.query(
        "UPDATE backlog_items SET isActive = 0 WHERE id = ?",
        [id]
    );
};

// Mettre à jour le statut de tous les items d'un sprint
exports.updateStatusBySprint = (sprintId, status) => {
    return db.query(
        "UPDATE backlog_items SET status = ? WHERE sprint_id = ?",
        [status, sprintId]
    );
};

// Calculer la somme des story points pour un sprint
exports.sumStoryPointsBySprint = (sprintId) => {
    return db.query(
        "SELECT SUM(story_points) as total FROM backlog_items WHERE sprint_id = ? AND status = 'DONE'",
        [sprintId]
    );
};

// Reordering logic helpers
exports.shiftPositions = (sprintId, status, fromPos, direction) => {
    // direction: 1 (inc) or -1 (dec)
    const op = direction > 0 ? "+" : "-";
    return db.query(
        `UPDATE backlog_items SET position = position ${op} 1 
         WHERE sprint_id = ? AND status = ? AND position >= ?`,
        [sprintId, status, fromPos]
    );
};

exports.reorderInSameColumn = (sprintId, status, fromPos, toPos) => {
    if (fromPos < toPos) {
        return db.query(
            `UPDATE backlog_items SET position = position - 1 
             WHERE sprint_id = ? AND status = ? AND position > ? AND position <= ?`,
            [sprintId, status, fromPos, toPos]
        );
    } else {
        return db.query(
            `UPDATE backlog_items SET position = position + 1 
             WHERE sprint_id = ? AND status = ? AND position >= ? AND position < ?`,
            [sprintId, status, toPos, fromPos]
        );
    }
};

exports.removeFromColumn = (sprintId, status, fromPos) => {
    return db.query(
        `UPDATE backlog_items SET position = position - 1 
         WHERE sprint_id = ? AND status = ? AND position > ?`,
        [sprintId, status, fromPos]
    );
};

exports.isMember = (projectId, userId) => {
    return db.query(
        "SELECT * FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
    );
};

exports.logChange = (backlogItemId, userId, action, fieldChanged, oldValue, newValue) => {
    const { v4: uuid } = require('uuid');
    return db.query(
        "INSERT INTO backlog_history (id, backlog_item_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [uuid(), backlogItemId, userId, action, fieldChanged, oldValue, newValue]
    );
};

// Acceptance Criteria
exports.getAcceptanceCriteria = (backlogItemId) => {
    return db.query("SELECT * FROM backlog_acceptance_criteria WHERE backlog_item_id = ? ORDER BY created_at", [backlogItemId]);
};

exports.addAcceptanceCriterion = (criterion) => {
    const { id, backlog_item_id, description } = criterion;
    const { v4: uuid } = require('uuid');
    return db.query(
        "INSERT INTO backlog_acceptance_criteria (id, backlog_item_id, description) VALUES (?, ?, ?)",
        [uuid(), backlog_item_id, description]
    );
};

exports.updateAcceptanceCriterion = (id, data) => {
    const fields = [];
    const values = [];
    for (const key in data) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }
    if (!fields.length) return Promise.resolve();
    values.push(id);
    return db.query(
        `UPDATE backlog_acceptance_criteria SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
    );
};

exports.deleteAcceptanceCriterion = (id) => {
    return db.query("DELETE FROM backlog_acceptance_criteria WHERE id = ?", [id]);
};

// Attachments
exports.getAttachments = (backlogItemId) => {
    return db.query("SELECT * FROM backlog_attachments WHERE backlog_item_id = ? ORDER BY created_at", [backlogItemId]);
};

exports.addAttachment = (attachment) => {
    const { id, backlog_item_id, filename, original_name, mime_type, size, path, uploaded_by } = attachment;
    const { v4: uuid } = require('uuid');
    return db.query(
        "INSERT INTO backlog_attachments (id, backlog_item_id, filename, original_name, mime_type, size, path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuid(), backlog_item_id, filename, original_name, mime_type, size, path, uploaded_by]
    );
};

exports.deleteAttachment = (id) => {
    return db.query("DELETE FROM backlog_attachments WHERE id = ?", [id]);
};

// History
exports.getHistory = (backlogItemId) => {
    return db.query(`
        SELECT bh.*, u.first_name, u.last_name FROM backlog_history bh
        JOIN users u ON bh.user_id = u.id
        WHERE bh.backlog_item_id = ? ORDER BY bh.created_at DESC
    `, [backlogItemId]);
};
