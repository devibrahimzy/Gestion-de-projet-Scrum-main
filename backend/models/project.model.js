const db = require("../config/database");

/* ===================== PROJECTS ===================== */

exports.findAll = () => {
    return db.query(
        "SELECT * FROM projects WHERE isActive = 1 ORDER BY created_at DESC"
    );
};

exports.findById = (id) => {
    return db.query(
        "SELECT * FROM projects WHERE id = ? AND isActive = 1",
        [id]
    );
};

exports.create = (project) => {
    const { id, name, description, start_date, end_date, created_by } = project;

    return db.query(
        `INSERT INTO projects 
        (id, name, description, start_date, end_date, status, isActive, created_by)
        VALUES (?, ?, ?, ?, ?, 'PLANNING', 1, ?)`,
        [id, name, description, start_date, end_date, created_by]
    );
};
exports.findProjectsByUser = (userId) => {
    return db.query(
        `SELECT 
            p.id,
            p.name,
            p.description,
            p.start_date,
            p.end_date,
            p.status,
            p.isActive,
            pm.role,
            pm.joined_at
        FROM projects p
        JOIN project_members pm ON pm.project_id = p.id
        WHERE pm.user_id = ?
          AND p.isActive = 1`,
        [userId]
    );
};


exports.isScrumMaster = (projectId, userId) => {
    return db.query(
        `SELECT * FROM project_members
         WHERE project_id = ? AND user_id = ? AND role = 'SCRUM_MASTER'`,
        [projectId, userId]
    );
};
exports.softDelete = (id) => {
    return db.query(
        "UPDATE projects SET isActive = 0 WHERE id = ?",
        [id]
    );
};

exports.update = (id, project) => {
    const { name, description, start_date, end_date, status, isActive } = project;
    return db.query(
        "UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, isActive = ? WHERE id = ?",
        [name, description, start_date, end_date, status, isActive, id]
    );
};


/* ===================== PROJECT MEMBERS ===================== */

exports.addMember = (member) => {
    const { id, project_id, user_id, role } = member;

    return db.query(
        "INSERT INTO project_members (id, project_id, user_id, role) VALUES (?, ?, ?, ?)",
        [id, project_id, user_id, role]
    );
};

exports.getMembers = (projectId) => {
    return db.query(
        `SELECT pm.role, u.id, u.first_name, u.last_name, u.email
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = ?`,
        [projectId]
    );
};

exports.removeMember = (projectId, userId) => {
    return db.query(
        "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
    );
};
