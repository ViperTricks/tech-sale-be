const express = require("express");
const router = express.Router();

// import controller
const controller = require("../controllers/auth.controller");

// middleware auth
const auth = require("../middleware/auth");

// ======================
// AUTH
// ======================
router.post("/register", controller.register);
router.post("/login", controller.login);

// ======================
// 🔥 SET ADMIN (dùng query ?email=...)
// ======================
router.get("/set-admin", controller.setAdminByEmail);

// ======================
// PROFILE
// ======================
router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, controller.updateProfile);

module.exports = router;