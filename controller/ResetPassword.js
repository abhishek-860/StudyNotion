const user = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
      try {
            const email = req.body;
      const user = await user.findOne({email: email}); 
      if(!user){
            return res.json({
                  success: true,
                  message:'Your Email is not registered with us',
            });
      }
      const token = crypto.randomUUID();
      const updatedDetails = await user.FindOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires: Date.now() + 5*60*1000,
      },
      {new:true}
      );
      const url = `http://localhost:3000/update-password/${token}`
      await mailSender(email, "Password reset Link",`Password Reset Link: &{url}`);
      return res.json({
            success: true,
            message: 'Email sent successfully, check Email and reset password',
      })
} catch(error){
      console.error(error);
      return res.status(500).json({
            success: false,
            message:"Error occurred while reseting password",
      });
}
}
exports.resetPassword = async(req, res) => {
      try {
            const {password, confirmPassword, token} = req.body;
            if(password != confirmPassword){
                  return res.json({
                        success: true,
                        message: 'Password is not same for the both sections',
                  });
            }
            const userDetails = await user.findOne({token: token});
            if(!userDetails){
                  return res.json({
                        success: false,
                        message: 'Token is invalid',
                  });
            }
            if (!userDetails.resetPasswordExpires > Date.now()){
                  return res.json({
                        success: false,
                        message: `Token is expired, please regenerate your token`,
                  });
            }
            const hashedPassword = await bcrypt(password, 10);
            await user.findOneAndUpdate({
                  token:token
            },{password:hashedPassword},{new:true},
      );
      return res.status(200).json({
            success: true,
            message:"Password reset successfull",
      });
      } catch (error) {
            
      }
}