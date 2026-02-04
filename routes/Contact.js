const express = require("express");
const router = express.Router();
const { contactUsController } = require("../controller/ContactUs");

router.post("/contact", contactUsController);

module.exports = router;