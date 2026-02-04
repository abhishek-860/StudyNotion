const express = require("express");
const router = express.Router();

const {
      createCourse, getAllCourses, getCourseDetails, getFullCourseDetails, editCourse, getInstructorCourses, deleteCourse,
} = require("../controller/Course");

const {
      showAllCategories, createCategory, categoryPageDetails,
} = require("../controller/Section");

const {
      createSection, updateSection, deleteSection, 
} = require("../controller/Section");

const {
      createSubSection, updateSubSection, deleteSubSection, 
} = require("../controller/Subsection");

const {
      createRating, getAverageRating, getAllRating,
} = require("../controller/RatingAndReview");

const {
      updateCourseProgress
} = require("../controller/courseProgress");

const {
      auth, isInstructor, isStudent, isAdmin 
} = require("../middleware/auth");

router.post("/createCourse", auth, isInstructor, createCourse);

router.post("/addSection", auth, isInstructor, createSection);

router.post("/updateSection", auth, isInstructor, updateSection);

router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/updateSubSection", auth, isInstructor, updateSubSection);

router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);

router.get("/getAllCourses", getAllCourses);

router.post("/getCourseDetails", getCourseDetails);

router.post("/getFullCourseDetails", auth, getFullCourseDetails);

router.post("/editCourse", auth, isInstructor, editCourse);

router.get("/deleteCourses", auth, isInstructor, getInstructorCourses);

router.delete("/deleteCourses", deleteCourse);

router.post("/updateCourseProgress", auth, isInstructor, updateCourseProgress);

router.post("/createCategory", auth, isAdmin, createCategory);

router.get("/showAllCategories", showAllCategories);

router.post("/getCategoryPageDetails", categoryPageDetails);

router.post("/createRating", auth, isStudent, createRating);

router.get("/getAverageRating", getAverageRating);

router.get("/getReviews", getAllRating);

module.exports = router;