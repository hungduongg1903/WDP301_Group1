const express = require("express");
const {
  login,
  register,
  logout,
  verifyemail,
  forgotPassword,
  resetPassword,
  checkAuth,
} = require("../controllers/auth.controller.js");

const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyemail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router; 
