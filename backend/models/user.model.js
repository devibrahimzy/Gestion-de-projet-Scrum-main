const db = require("../config/database");

exports.findByEmail = (email) => {
    return db.query("SELECT * FROM users WHERE email = ?", [email]);
};

exports.create = (user) => {
    const { id, email, password, first_name, last_name, role } = user;
    return db.query(
        "INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
        [id, email, password, first_name, last_name, role]
    );
};
