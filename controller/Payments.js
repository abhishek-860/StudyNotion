const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: webhooks } = require("razorpay/dist/types/webhooks");

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
            }) 
}
}