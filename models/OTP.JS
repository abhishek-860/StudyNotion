import mailSender from "../utils/mailSender";

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
            console.log("Email sent successfully: ",mailResponse);
      } catch (error) {
            console.log("error happended while sending mails: ",error);
            throw error;
      }
}
otpSchema.pre("save", async function(next){
      await sendVerificationEmail(this.email, this.otp);
      next();
})
module.exports = mongoose.model("OTP", otpSchema);