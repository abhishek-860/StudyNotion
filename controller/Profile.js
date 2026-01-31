const Profile = require("../models/Profile");
const User = require("../models/User");
exports.updateProfile = async(req, res) => {
      try {
            const {dateOfBirth="", about="", contactNumber, gender} = req.body;
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
                  message:'Account Detailed failed to fetch',
                  error: error.message,
            });
      }
}