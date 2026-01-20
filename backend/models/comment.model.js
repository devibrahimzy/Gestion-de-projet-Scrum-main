const db = require("../config/database");

exports.create = (comment) => {
    const { id, backlog_item_id, user_id, content } = comment;
    return db.query(
        "INSERT INTO backlog_item_comments (id, backlog_item_id, user_id, content) VALUES (?, ?, ?, ?)",
        [id, backlog_item_id, user_id, content]
    );
};

exports.findByItem = (backlogItemId) => {
    return db.query(
        `SELECT bic.*, u.first_name, u.last_name 
         FROM backlog_item_comments bic
         JOIN users u ON bic.user_id = u.id
         WHERE bic.backlog_item_id = ? AND bic.isActive = 1
         ORDER BY bic.created_at DESC`,
        [backlogItemId]
    );
};

exports.softDelete = (id) => {
    return db.query("UPDATE backlog_item_comments SET isActive = 0 WHERE id = ?", [id]);
};
