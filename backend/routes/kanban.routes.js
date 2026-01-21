const router = require("express").Router();
const kanbanController = require("../controllers/kanban.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:sprintId", auth, kanbanController.getKanbanBoard);
router.patch("/move/:id", auth, kanbanController.moveKanbanItem);

// Column management
router.get("/columns/:projectId", auth, kanbanController.getKanbanColumns);
router.post("/columns/:projectId", auth, kanbanController.addKanbanColumn);
router.put("/columns/:columnId", auth, kanbanController.updateKanbanColumn);
router.delete("/columns/:columnId", auth, kanbanController.deleteKanbanColumn);

module.exports = router;
