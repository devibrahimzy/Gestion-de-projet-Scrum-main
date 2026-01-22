const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:projectId/summary", auth, dashboardController.getProjectDashboard);
router.get("/:projectId/velocity", auth, dashboardController.getVelocityData);
router.get("/:projectId/agile", auth, dashboardController.getAgilePerformance);
router.get("/:projectId/burndown", auth, dashboardController.getBurndownData);
router.get("/:projectId/health", auth, dashboardController.getHealthIndicators);
router.get("/:projectId/report", auth, dashboardController.generateProjectReport);
router.get("/:projectId/export/backlog", auth, dashboardController.exportBacklogCSV);

module.exports = router;
