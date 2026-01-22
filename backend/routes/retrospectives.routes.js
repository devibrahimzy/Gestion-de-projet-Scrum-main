const router = require("express").Router();
const retroController = require("../controllers/retrospective.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/sprint/:sprintId", auth, retroController.getRetroBySprint);
router.post("/", auth, retroController.createRetrospective);
router.patch("/:id/publish", auth, retroController.publishRetrospective);
router.post("/items", auth, retroController.addItem);
router.post("/items/:id/vote", auth, retroController.voteItem);
router.patch("/items/:id/status", auth, retroController.updateItemStatus);
router.delete("/items/:id", auth, retroController.deleteItem);

router.get("/project/:projectId", auth, retroController.getRetrosByProject);
router.get("/project/:projectId/trends", auth, retroController.getTrends);
router.get("/:id/export-pdf", auth, retroController.exportRetrospectivePDF);

module.exports = router;
