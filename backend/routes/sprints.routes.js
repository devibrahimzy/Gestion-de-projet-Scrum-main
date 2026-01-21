const router = require("express").Router();
const sprintController = require("../controllers/sprint.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, sprintController.getSprintsByProject);
router.get("/velocity-chart", auth, sprintController.getVelocityChart);
router.get("/active", auth, sprintController.getActiveSprint);
router.post("/", auth, sprintController.createSprint);
router.put("/:id", auth, sprintController.updateSprint);
router.delete("/:id", auth, sprintController.deleteSprint);
router.put("/:id/activate", auth, sprintController.activateSprint);
router.put("/:id/complete", auth, sprintController.completeSprint);
router.get("/:id/burndown", auth, sprintController.getBurndownChart);
router.post("/:sprintId/items", auth, sprintController.moveItemToSprint);
router.delete("/:sprintId/items/:itemId", auth, sprintController.removeItemFromSprint);


module.exports = router;
