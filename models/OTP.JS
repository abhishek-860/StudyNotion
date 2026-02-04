const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
      email: {
            type: String,
            required:true,
      },
      otp: {
            type: String,
            required: true,
      },
      createdAt: {
            type: Date,
            default: Date.now(),
            expires: 5 * 60,
      }
});
async function sendVerificationEmail(email, otp) {
      try {
            const mailResponse = await mailSender(email,"Verification Email from StudyNotion", otp);
            console.log("Email sent successfully: ",mailResponse.response);
      } catch (error) {
            console.log("error happended while sending mails: ",error);
            throw error;
      }
}
otpSchema.pre("save", async function(next){
      if(this.isNew){
      await sendVerificationEmail(this.email, this.otp);
      }
      next();
})
const OTP = mongoose.model("OTP",otpSchema)
module.exports = mongoose.model("OTP", otpSchema);