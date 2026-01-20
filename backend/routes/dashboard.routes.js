const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:projectId/summary", auth, dashboardController.getProjectDashboard);
router.get("/:projectId/velocity", auth, dashboardController.getVelocityData);
router.get("/:projectId/agile", auth, dashboardController.getAgilePerformance);

module.exports = router;
