const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, controller.updateProfile);
router.put("/change-email", auth, controller.changeEmail);
router.put("/change-password", auth, controller.changePassword);

router.post("/logout", auth, controller.logout);
router.post("/create-admin", controller.createAdmin);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/verify", controller.verifyAccount);




module.exports = router;
