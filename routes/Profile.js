const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");
const {
      deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture, getEnrolledCourses, instructorDashboard,
} = require("../controller/Profile")