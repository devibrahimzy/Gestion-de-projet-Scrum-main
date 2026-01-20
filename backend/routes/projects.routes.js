const router = require("express").Router();
const projectController = require("../controllers/project.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/my-projects", auth, projectController.getMyProjects);


router.get("/", auth, projectController.getAllProjects);
router.post("/", auth, projectController.createProject);
router.put("/:id", auth, projectController.updateProject);
router.delete("/:id", auth, projectController.deleteProject);
router.get("/:id", auth, projectController.getProjectById);


router.get("/:id/members", auth, projectController.getProjectMembers);
router.post("/members", auth, projectController.addMember);
router.delete("/:id/members/:userId", auth, projectController.removeMember);

module.exports = router;
