const router = require("express").Router();
const kanbanController = require("../controllers/kanban.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:sprintId", auth, kanbanController.getKanbanBoard);
router.patch("/move/:id", auth, kanbanController.moveKanbanItem);

module.exports = router;
