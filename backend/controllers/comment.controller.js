const Comment = require("../models/comment.model");
const { v4: uuid } = require("uuid");

exports.addComment = async (req, res) => {
    try {
        const { backlog_item_id, content } = req.body;
        if (!backlog_item_id || !content) {
            return res.status(400).json({ message: "Item ID and content are required" });
        }

        const newComment = {
            id: uuid(),
            backlog_item_id,
            user_id: req.user.id,
            content
        };

        await Comment.create(newComment);
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: "Error adding comment", error: err.message });
    }
};

exports.getCommentsByItem = async (req, res) => {
    try {
        const [comments] = await Comment.findByItem(req.params.itemId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving comments", error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        await Comment.softDelete(req.params.id);
        res.json({ message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting comment", error: err.message });
    }
};
