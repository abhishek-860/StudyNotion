const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/secToDuration");
exports.updateProfile = async(req, res) => {
      try {
            const {firstName = "", lastName = "",dateOfBirth="", about="", contactNumber, gender} = req.body;
            const id = req.user.id;
            if(!contactNumber || !gender || !id){
                  return res.status(400).json({
                        success: true,
                        message:'All fields are required',
                  });
            }
            const userDetails = await User.findById(id);
            const profileId = userDetails.additionalDetail;
            const profileDetails = await Profile.findById(profileId);
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about = about;
            profileDetails.gender = gender;
            profileDetails.contactNumber = contactNumber;
            await profileDetails.save();
            return res.status(200).json({
                  success: true,
                  message:'Profile Updated Successfully',
                  profileDetails,
            });
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'Profile update failed',
                  error: error.message,
            });
      }
}
exports.deleteAccount = async (req, res) => {
      try {
            const id = req.user.id;
            const userDetails = await User.findById(id);
            if(!userDetails){
                  return res.status(404).json({
                  success: false,
                  message:'Account not found',
            });
            }
            await Profile.findByIdAndDelete({_id:userDetails.additionalDetail});
            await User.findByIdAndDelete({_id:id});
            return res.status(200).json({
                  success: true,
                  message:'Account Deleted successfully',
            });
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'Account Deletion failed',
                  error: error.message,
            });
      }
}
const getAllUserDetails = async (req, res) => {
      try {
            const id = req.user.id;
            const userDetails = await User.findById(id).populate("additionalDetails").exec();
            return res.status(200).json({
                  success: true,
                  message: "All Details Fetched successfully",
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'Account Detailed failed to Fetch',
                  error: error.message,
            });
      }
}
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}