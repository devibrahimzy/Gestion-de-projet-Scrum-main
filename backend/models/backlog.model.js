const db = require("../config/database");

exports.findAllByProject = (projectId) => {
    return db.query(
        `SELECT * FROM backlog_items
         WHERE project_id = ? AND isActive = 1
         ORDER BY priority DESC, created_at ASC`,
        [projectId]
    );
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
    const { id, project_id, sprint_id, title, description, type, story_points, priority, status, position, assigned_to_id, created_by_id } = item;
    return db.query(
        "INSERT INTO backlog_items (id, project_id, sprint_id, title, description, type, story_points, priority, status, position, assigned_to_id, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, project_id, sprint_id, title, description, type || 'USER_STORY', story_points || 0, priority || 0, status || 'BACKLOG', position || 0, assigned_to_id, created_by_id]
    );
};

exports.update = (id, data) => {
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
        `UPDATE backlog_items SET ${fields.join(", ")} WHERE id = ?`,
        values
    );
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
