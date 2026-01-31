const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenereator = require("otp-generator")
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");

exports.sendOTP = async (req, res) => {
      try {
           const {email} = req.body;
           const checkUserPresent = await User.findOne({email});
           if(checkUserPresent){
            return res.status(401).json({
                  success: false,
                  message:'User already registered',
            })
           } 
           var otp = otpGenereator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars: false,
           });
           console.log("OTP generated: ", otp);
           const result = await OTP.findOne({otp: otp});
           while(result){
            otp = otpGenereator(6, {
                  upperCaseAlphabets: false,
                  lowerCaseAlphabets:false,
                  specialChars:false
            });
            result = await OTP.findOne({otp: otp});
           }
           const otpPayload = {email, otp};
           const otpBody = await OTP.create(otpPayload);
           console.log(otpBody);
           res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
           });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success:false,
                  message: 'Error Detected'
            });
      }
};
exports.signUp = async (req,res) => {
      try {
            const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp 
            } = req.body;
            if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
                  return res.status(403).json({
                        success:false,
                        message:"All fields are required",
                  });
            }
            if(password != confirmPassword){
                  return res.status(400).json({
                        success:true,
                        messgae:'password and confirmPassword does not match, please try again'
                  });
            }
            const existingUser = await User.findOne({email});
            if(!existingUser){
                  return res.status(400).json({
                        success:false,
                        message: 'User already registered'
                  });
            }
            const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
            console.log(recentOtp);
            if (recentOtp.length == 0) {
             return res.status(400).json({
                  success:false,
                  message:'OTP found'
             })     
            } else if(otp != recentOtp.otp){
                  return res.status(400).json({
                        success:false,
                        message:'Invalid OTP',
                  });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const profileDetails = await Profiler.create({
                  gender:null,
                  dateOfBirth:null,
                  about:null,
                  contactNumber:null,
            });
            const user = await User.create({
                  firstName, lastName, email, contactNumber,password: hashedPassword, accountType, additionalDetails:profileDetails._id,
                  image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
            });
            return res.status(200).json({
                  success:true,
                  message:'User is registered successfully', user,
            });
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success:false,
                  message:"User cannot be registered. Please try again"
            });
      }
}
exports.login = async (req, res) => {
      try {
            const {email, password} = req.body;
            if(!email || !password){
                  return res.status(403).json({
                        success:false,
                        message:'All fields are required, please try again',
                  });
            }
            const user = await User.findOne({email}).populate("additionalDetails");
            if(!user){
                  return res.status(401).json({
                        success: true,
                        message:"User not registered, please signup first",
                  });
            }
            if(await bcrypt.compare(password, user.password)){
                  const payload = {
                        email: user.email,
                        id: user._id,
                        accountType: user.accountType,
                  }
                  const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: "2h",
                  });
                  user.token = token;
                  user.password = undefined;

                  const options = {
                        expires: new Date(Date.now()+ 3*24*60*60*1000),
                        httpOnly:true,
                  }
                  res.cookie("token", token, options).status(200).json({
                        success:true,
                        token,
                        user,
                        message:'Logged in successfully',
                  })
            }
            else {
                  return res.status(401).json({
                        success: false,
                        message:'Incorrect password detected while Logging, please try again',
                  })
            }
      } catch (error) {
            console.error(error);
            return res.status(500).json({
                  success: false,
                  message: 'login failed'
            })
      }
}