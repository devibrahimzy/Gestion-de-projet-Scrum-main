const db = require("../config/database");

exports.findByEmail = (email) => {
    return db.query("SELECT * FROM users WHERE email = ?", [email]);
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
