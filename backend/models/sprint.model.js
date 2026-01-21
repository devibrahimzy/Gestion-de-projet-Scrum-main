const db = require("../config/database");

exports.findAllByProject = (projectId) => {
    return db.query(
        `SELECT s.*, 
                (SELECT COUNT(*) FROM backlog_items bi WHERE bi.sprint_id = s.id AND bi.status = 'DONE') as completed_items,
                (SELECT COUNT(*) FROM backlog_items bi WHERE bi.sprint_id = s.id AND bi.status != 'DONE') as pending_items
         FROM sprints s
         WHERE s.project_id = ? AND s.isActive = 1
         ORDER BY s.start_date DESC`,
        [projectId]
    );
};


exports.findById = (id) => {
    return db.query("SELECT * FROM sprints WHERE id = ?", [id]);
};

exports.create = (sprint) => {
    const { id, project_id, name, objective, start_date, end_date, status, planned_velocity, isActive } = sprint;
    return db.query(
        "INSERT INTO sprints (id, project_id, name, objective, start_date, end_date, status, planned_velocity, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, project_id, name, objective, start_date, end_date, status || 'PLANNING', planned_velocity || 0, isActive !== undefined ? isActive : 1]
    );
};

exports.update = (id, sprint) => {
    const { name, objective, start_date, end_date, status, planned_velocity, actual_velocity, isActive } = sprint;
    return db.query(
        "UPDATE sprints SET name = ?, objective = ?, start_date = ?, end_date = ?, status = ?, planned_velocity = ?, actual_velocity = ?, isActive = ? WHERE id = ?",
        [name, objective, start_date, end_date, status, planned_velocity, actual_velocity, isActive, id]
    );
};

// Mise à jour partielle (uniquement les champs fournis)
exports.updatePartial = (id, data) => {
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
        `UPDATE sprints SET ${fields.join(", ")} WHERE id = ?`,
        values
    );
};

exports.updateStatus = (id, status) => {
    const allowed = ['PLANNING', 'ACTIVE', 'COMPLETED'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);
    return db.query("UPDATE sprints SET status = ? WHERE id = ?", [status, id]);
};

exports.softDelete = (id) => {
    return db.query(
        "UPDATE sprints SET isActive = 0 WHERE id = ?",
        [id]
    );
};

exports.getAverageVelocity = (projectId) => {
    return db.query(
        "SELECT AVG(actual_velocity) as avg_velocity FROM sprints WHERE project_id = ? AND status = 'COMPLETED' AND actual_velocity > 0",
        [projectId]
    );
};

// Burndown data
exports.recordBurndownData = (sprintId, date, remainingPoints) => {
    return db.query(
        "INSERT INTO burndown_data (id, sprint_id, date, remaining_story_points) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE remaining_story_points = ?",
        [require('uuid').v4(), sprintId, date, remainingPoints, remainingPoints]
    );
};

exports.getBurndownData = (sprintId) => {
    return db.query(
        "SELECT date, remaining_story_points FROM burndown_data WHERE sprint_id = ? ORDER BY date",
        [sprintId]
    );
};

exports.calculateRemainingPoints = (sprintId) => {
    return db.query(
        "SELECT SUM(story_points) as remaining FROM backlog_items WHERE sprint_id = ? AND status != 'DONE'",
        [sprintId]
    );
};


