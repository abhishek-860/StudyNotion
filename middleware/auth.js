const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => { 
      try {
            const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");
            if(!token){
                  return res.status(401).json({
                        success:false,
                        message:'Token is missing',
                  });
            }
            try {
                  const decode = jwt.verify(token, process.env.JWT_SECRET);
                  console.log(decode);
                  req.user = decode;
            } catch (error) {
                  return res.status(401).json({
                        success:false,
                        message: "Token is invalid",
                  });
            }
            next();
      } catch (error) {
            return res.status(401).json({
                        success:false,
                        message: "Something went wrong while validating the token",
                  });
      }
}
exports.isStudent = async (req, res, next) => {
      try {
            if (req.user.accountType !== 'Student') {
                  return res.status(401).json({
                        success:true,
                        message:'This is a protected route for students only'
                  });
            }
            next();
      } catch (error) {
            return res.status(401).json({
                  success: false,
                  message:'role is not verified'
            });
      }
}
exports.isInstructor = async (req, res, next) => {
      try {
            if (req.user.accountType !== 'Instructor') {
                  return res.status(401).json({
                        success:false,
                        message:'This is a protected route for Instructor only'
                  });
            }
            next();
      } catch (error) {
            return res.status(401).json({
                  success: false,
                  message:'role is not verified'
            });
      }
}
exports.isAdmin = async (req, res, next) => {
      try {
            if (req.user.accountType !== 'Admin') {
                  return res.status(401).json({
                        success:true,
                        message:'This is a protected route for Admins only'
                  });
            }
            next();
      } catch (error) {
            return res.status(401).json({
                  success: false,
                  message:'role is not verified'
            });
      }
}
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};