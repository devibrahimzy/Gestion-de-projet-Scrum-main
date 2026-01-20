const db = require("../config/database");

exports.findAllByProject = (projectId) => {
    return db.query(
        `SELECT * FROM sprints
         WHERE project_id = ? AND isActive = 1
         ORDER BY start_date DESC`,
        [projectId]
    );
};


exports.findById = (id) => {
    return db.query("SELECT * FROM sprints WHERE id = ?", [id]);
};

exports.create = (sprint) => {
    const { id, project_id, name, start_date, end_date, status, planned_velocity, isActive } = sprint;
    return db.query(
        "INSERT INTO sprints (id, project_id, name, start_date, end_date, status, planned_velocity, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, project_id, name, start_date, end_date, status || 'PLANNING', planned_velocity || 0, isActive !== undefined ? isActive : 1]
    );
};

exports.update = (id, sprint) => {
    const { name, start_date, end_date, status, planned_velocity, actual_velocity, isActive } = sprint;
    return db.query(
        "UPDATE sprints SET name = ?, start_date = ?, end_date = ?, status = ?, planned_velocity = ?, actual_velocity = ?, isActive = ? WHERE id = ?",
        [name, start_date, end_date, status, planned_velocity, actual_velocity, isActive, id]
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


