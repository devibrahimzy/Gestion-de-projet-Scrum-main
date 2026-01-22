const db = require("../config/database");

/* ===================== PROJECTS ===================== */

exports.findAll = () => {
    return db.query(
        "SELECT id, name, description, start_date, end_date, status, methodology, sprint_duration, objectives, created_at, updated_at, isActive, created_by FROM projects WHERE isActive = 1 ORDER BY created_at DESC"
    );
};

exports.findById = (id) => {
    return db.query(
        "SELECT id, name, description, start_date, end_date, status, methodology, sprint_duration, objectives, created_at, updated_at, isActive, created_by FROM projects WHERE id = ? AND isActive = 1",
        [id]
    );
};

exports.create = (project) => {
    const { id, name, description, start_date, end_date, methodology, sprint_duration, objectives, created_by } = project;

    return db.query(
        `INSERT INTO projects
        (id, name, description, start_date, end_date, methodology, sprint_duration, objectives, status, isActive, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PLANNING', 1, ?)`,
        [id, name, description, start_date, end_date, methodology, sprint_duration, objectives, created_by]
    );
};
exports.findProjectsByUser = (userId, filters = {}) => {
    let whereClause = "pm.user_id = ? AND p.isActive = 1";
    const params = [userId];

    if (filters.status && filters.status !== 'all') {
        whereClause += " AND p.status = ?";
        params.push(filters.status);
    }

    let orderBy = "p.created_at DESC";
    if (filters.sortBy) {
        const direction = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        if (filters.sortBy === 'name') {
            orderBy = `p.name ${direction}`;
        } else if (filters.sortBy === 'created_at') {
            orderBy = `p.created_at ${direction}`;
        } else if (filters.sortBy === 'updated_at') {
            orderBy = `p.updated_at ${direction}`;
        }
    }

    return db.query(
        `SELECT
            p.id,
            p.name,
            p.description,
            p.start_date,
            p.end_date,
            p.status,
            p.methodology,
            p.sprint_duration,
            p.objectives,
            p.created_at,
            p.updated_at,
            p.isActive,
            pm.role,
            pm.joined_at,
            (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) as member_count,
            COALESCE(ROUND((SELECT COUNT(*) FROM backlog_items bi WHERE bi.project_id = p.id AND bi.status = 'DONE') / NULLIF((SELECT COUNT(*) FROM backlog_items bi2 WHERE bi2.project_id = p.id), 0) * 100, 2), 0) as progress_percentage
        FROM projects p
        JOIN project_members pm ON pm.project_id = p.id
        WHERE ${whereClause}
        ORDER BY ${orderBy}`,
        params
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

exports.update = (id, project, userId) => {
    const { name, description, start_date, end_date, methodology, sprint_duration, objectives, status, isActive } = project;
    return db.query(
        "UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ?, methodology = ?, sprint_duration = ?, objectives = ?, status = ?, isActive = ?, updated_at = NOW() WHERE id = ?",
        [name, description, start_date, end_date, methodology, sprint_duration, objectives, status, isActive, id]
    );
};

exports.logChange = (projectId, userId, action, fieldChanged, oldValue, newValue) => {
    const { v4: uuid } = require('uuid');
    return db.query(
        "INSERT INTO project_audit (id, project_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [uuid(), projectId, userId, action, fieldChanged, oldValue, newValue]
    );
};

exports.hardDelete = (id) => {
    // This would delete all associated data - use with caution
    return db.query("DELETE FROM projects WHERE id = ?", [id]);
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

exports.reassignTasks = (userId) => {
    // Reassign tasks to null (back to backlog)
    return db.query(
        "UPDATE backlog_items SET assigned_to_id = NULL WHERE assigned_to_id = ?",
        [userId]
    );
};

// Invitations
exports.inviteMember = (invitation) => {
    const { id, project_id, email, role, invited_by, token, expires_at } = invitation;
    return db.query(
        "INSERT INTO project_invitations (id, project_id, email, role, invited_by, token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, project_id, email, role, invited_by, token, expires_at]
    );
};

exports.getInvitationByToken = (token) => {
    return db.query(
        "SELECT * FROM project_invitations WHERE token = ? AND expires_at > NOW() AND status = 'PENDING'",
        [token]
    );
};

exports.updateInvitationStatus = (id, status) => {
    return db.query(
        "UPDATE project_invitations SET status = ? WHERE id = ?",
        [status, id]
    );
};
