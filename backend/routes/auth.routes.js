const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

router.post("/logout", auth, controller.logout);
router.post("/create-admin", controller.createAdmin);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/verify", controller.verifyAccount);




module.exports = router;
