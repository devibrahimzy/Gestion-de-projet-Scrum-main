const router = require("express").Router();
const commentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:itemId", auth, commentController.getCommentsByItem);
router.post("/", auth, commentController.addComment);
router.delete("/:id", auth, commentController.deleteComment);

module.exports = router;
