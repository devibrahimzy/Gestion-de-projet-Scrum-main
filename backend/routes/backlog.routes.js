const router = require("express").Router();
const backlogController = require("../controllers/backlog.controller");
const auth = require("../middlewares/auth.middleware");

console.log('Loading backlog routes...');

router.get("/", auth, backlogController.getBacklogByProject);
router.get("/test", (req, res) => res.json({ message: "Backlog routes working" }));
router.get("/:id", auth, backlogController.getBacklogItemById);
router.get("/sprint/:sprintId", auth, backlogController.getBacklogBySprint);
router.post("/", auth, backlogController.createBacklogItem);
router.put("/:id", auth, backlogController.updateBacklogItem);
console.log('Registering reorder route at /api/backlog/reorder');
router.post("/reorder", backlogController.reorderBacklogItems); // Temporarily remove auth for testing
router.put("/:id/reorder", auth, backlogController.reorderBacklogItem);
router.patch("/:id/assign", auth, backlogController.assignMember);
router.delete("/:id", auth, backlogController.deleteBacklogItem);

// Acceptance Criteria
router.get("/:id/criteria", auth, backlogController.getAcceptanceCriteria);
router.post("/:id/criteria", auth, backlogController.addAcceptanceCriterion);
router.put("/:id/criteria/:criterionId", auth, backlogController.updateAcceptanceCriterion);
router.delete("/:id/criteria/:criterionId", auth, backlogController.deleteAcceptanceCriterion);

// Attachments
router.get("/:id/attachments", auth, backlogController.getAttachments);
router.post("/:id/attachments", auth, backlogController.uploadAttachment);
router.delete("/:id/attachments/:attachmentId", auth, backlogController.deleteAttachment);

// History
router.get("/:id/history", auth, backlogController.getHistory);

module.exports = router;
