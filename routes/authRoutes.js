const express = require("express");
const { loginLimiter } = require("../middleware/loginLimiter.js");
const router = express.Router();
const { login, refresh, logout } = require("../controllers/authController.js");

router.route("/").post(loginLimiter, login);

router.route("/refresh").get(refresh);

router.route("/logout").post(logout);

module.exports = router;
