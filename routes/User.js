const express = require("express");
const router = express.Router();
 
const { login, signUp, sendOTP,} = require("../controller/Auth");

const { resetPasswordToken, resetPassword} = require("../controller/ResetPassword");

const { auth } = require("../middleware/auth");

router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendOTP", sendOTP);

router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);
module.exports = router;