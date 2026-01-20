const router = require("express").Router();
const backlogController = require("../controllers/backlog.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, backlogController.getBacklogByProject);
router.get("/:id", auth, backlogController.getBacklogItemById);
router.get("/sprint/:sprintId", auth, backlogController.getBacklogBySprint);
router.post("/", auth, backlogController.createBacklogItem);
router.put("/:id", auth, backlogController.updateBacklogItem);
router.patch("/:id/assign", auth, backlogController.assignMember);
router.delete("/:id", auth, backlogController.deleteBacklogItem);

module.exports = router;
