const db = require("../config/database");

exports.findByEmail = (email) => {
    return db.query("SELECT * FROM users WHERE email = ?", [email]);
};

exports.findById = (id) => {
    return db.query("SELECT * FROM users WHERE id = ?", [id]);
};

exports.create = (user) => {
    const { id, email, password, first_name, last_name, role, verification_code } = user;
    return db.query(
        "INSERT INTO users (id, email, password, first_name, last_name, role, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, email, password, first_name, last_name, role, verification_code]
    );
};

exports.incrementFailedAttempts = (email) => {
    return db.query(
        "UPDATE users SET failed_attempts = failed_attempts + 1 WHERE email = ?",
        [email]
    );
};

exports.resetFailedAttempts = (email) => {
    return db.query(
        "UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE email = ?",
        [email]
    );
};

exports.lockAccount = (email, lockUntil) => {
    return db.query(
        "UPDATE users SET lock_until = ? WHERE email = ?",
        [lockUntil, email]
    );
};

exports.updateLastLogin = (id) => {
    return db.query(
        "UPDATE users SET lastLogin = NOW() WHERE id = ?",
        [id]
    );
};

exports.verifyAccount = (email, code) => {
    return db.query(
        "UPDATE users SET is_verified = true, verification_code = NULL WHERE email = ? AND verification_code = ?",
        [email, code]
    );
};

exports.getProfile = (id) => {
    return db.query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.created_at, u.isActive, u.lastLogin, u.profile_photo,
               GROUP_CONCAT(p.name SEPARATOR ', ') as projects
        FROM users u
        LEFT JOIN project_members pm ON u.id = pm.user_id
        LEFT JOIN projects p ON pm.project_id = p.id AND p.isActive = 1
        WHERE u.id = ?
        GROUP BY u.id
    `, [id]);
};

exports.updateProfile = (id, updates) => {
    const fields = [];
    const values = [];
    if (updates.first_name) { fields.push('first_name = ?'); values.push(updates.first_name); }
    if (updates.last_name) { fields.push('last_name = ?'); values.push(updates.last_name); }
    if (updates.profile_photo) { fields.push('profile_photo = ?'); values.push(updates.profile_photo); }
    // Add preferences when implemented
    values.push(id);
    return db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
};

exports.changePassword = (id, newHashedPassword) => {
    return db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newHashedPassword, id]
    );
};
