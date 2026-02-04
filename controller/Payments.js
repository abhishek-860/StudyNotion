const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: webhooks } = require("razorpay/dist/types/webhooks");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");
const mongoose = require("mongoose")

exports.capturePayment = async (req,res) => {
      const {course_id} = req.body;
      const userId = req.user.id;
      if(!course_id){
            return res.json({
                  success: false,
                  message: "please provide valid course ID",
            });
      };
      let course;
      try {
            course = await Course.findById(course_id);
            if(course){
            return res.json({
                  success: false,
                  message: "Could not find course",
            });
      }
      const uid = new mongoose.Types.ObjectId(userId);
      if(course,studentEnrolled.includes(uid)){
            return res.status(200).json({
                  success: false,
                  message: "Student already enrolled",
            });
      }
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: error.message,
            });
      }
      const amount = course.price;
      const currency = "INR";
      const options = {
            amount: amount * 100,
            currency,
            receipt : Math.random(Date.now()).toString(),
            notes: {
                  courseId: course_id,
                  userId,
            }
      };
      try {
            const paymentResponse = instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                  success: true,
                  courseName: course.courseName,
                  courseDescription: course.courseDescription,
                  thumbnail: course.thumbnail,
                  orderId: (await paymentResponse).currency,
                  amount: (await paymentResponse).amount,
            })
      } catch (error) {
            console.error(error);
            res.json({
                  success: false,
                  message: "Could not initiate order",
            })
      }
};
exports.verifySignature = async (req, res) => {
      const webhookSecret = "12345678";
      const signature = req.headers["x-razorpay-signature"];
      
      const shasum = crypto.createHmac("sha256", webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if(signature === webhookSecret){
            console.log("Payment Authorised");
            const {courseId, userId} = req.body.payload.payment.entity.notes;
            try {
                  const enrolledCourse = await Course.findOneAndUpdate({
                        _id: courseId
                  }, {$push:{studentsEnrolled:userId}},
            {new:true},);
            if(!enrolledCourse){
                  return res.status(500).json({
                        success: false,
                        message: 'Course not found',
                  });
            }
            console.log(enrolledCourse);
            const studentsEnrolled = await User.findOneAndUpdate({
                  _id: userId
            }, {$push:{courses:courseId}},
      {new:true},);
            console.log(studentsEnrolled);
            const emailResponse = await mailSender(
                  studentsEnrolled.email,
                  "Congrats",
                  "Congratulations from owner",
            );
            console.log(emailResponse);
            return res.status(200).json({
                  success: true,
                  message: "New course added successfully",
            });
            } catch (error) {
                  console.error(error);
                  res.status(500).json({
                  success: false,
                  message: error.message,
            })
      }
}
else {
     res.status(400).json({
                  success: false,
                  message: 'Invalid request',
            });
}
}
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}