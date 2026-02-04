const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const Category = require("../models/Category");
const User = require("../models/User");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");

exports.createCourse = async (req, res) => {
      try {
            const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
            const thumbnail = req.files.thumbnailImage;
            if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
                  return res.status(400).json({
                        success: false,
                        message: 'All fields are required',
                  });
            }
            const userId = req.User.id;
            const instructorDetails = await User.findById(userId);
            console.log("Instructor Detaisl: ", instructorDetails);
            if(!instructorDetails){
                  return res.status(404).json({
                        success: true,
                        message:'Instructor Details not found',
                  });
            }
            const tagDetails = await Tag.findById(tag);
            if(!tagDetails){
                  return res.status(404).json({
                        success: true,
                        message:'Tag Details not found',
                  });
            }
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
            const newCourse = await Course.create({
                  courseName, courseDescription, instructor: instructorDetails._id,
                  whatYouWillLearn: whatYouWillLearn,
                  price, tag: tagDetails._id,
                  thumbnail: thumbnailImage.secure_url,
            });
            await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                  $push: {
                        courses: newCourse._id,
                  }
            },
            {new: true},
            );
            // update the tag ka schema
            // homework
            return res.status(200).json({
                  success: true,
                  message: "Course created Successfully",
                  data: newCourse,
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message: 'Error while creating course',
                  error: error.message,
            });
      }
};
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }
    await course.save()
    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "SubSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
exports.showAllCourses = async (req, res) => {
      try {
            const allCourses = await Course.find({}, {
                  courseName: true,
                  price: true,
                  thumbnail: true,
                  instructor: true,
                  ratingAndReviews:true,
                  studentsEnrolled: true,
            }).populate("instructor").exec();
            return res.staus(200).json({
                  success: true,
                  message: 'Data for all courses fetched successfully',
                  data: allCourses,
            })
      } catch (error) {
            return res.status(500).json({
                  success:false,
                  mesaage:'Cannot fetch course data',
                  error: error.message,
            });
      }
};
exports.getCourseDetails = async (req, res) => {
      try {
            const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "SubSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }
    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.SubSection.forEach((SubSection) => {
        const timeDurationInSeconds = parseInt(SubSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
      } catch (error) {
            return res.status(500).json({
                  success:false,
                  mesaage:'Cannot fetch course details',
                  error: error.message,
            });
      }
}