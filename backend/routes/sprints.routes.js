const router = require("express").Router();
const sprintController = require("../controllers/sprint.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, sprintController.getSprintsByProject);
router.post("/", auth, sprintController.createSprint);
router.put("/:id", auth, sprintController.updateSprint);
router.delete("/:id", auth, sprintController.deleteSprint);
router.put("/:id/activate", auth, sprintController.activateSprint);
router.put("/:id/complete", auth, sprintController.completeSprint);


module.exports = router;
