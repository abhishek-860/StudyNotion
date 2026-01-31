const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
      try {
            const {sectionId, title, timeDuration, description} = req.body;
            if(!sectionId || !title || !timeDuration || !description || !video) {
                  return res.status(400).json({
                        success: false,
                        message:'All fields are required',
                  });
            }
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            const subSectionDetails = await SubSection.create({
                  title: title,
                  timeDuration: timeDuration,
                  description: description,
                  videoUrl:uploadDetails.secure_url,
            });
            const UpdatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                  {$push :{
                        subSection:subSectionDetails._id,
                  }},
                  {new:true}
            );
            return res.status(200).json({
                  success: true,
                  message:'SubSection created successfully',
                  UpdatedSection,
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'SubSection creation failed',
                  error: error.message,
            });
      }
}
exports.updateSubSection = async (req, res) =>{
      try {
            const {title, sectionId} = req.body;
            if(!title || !sectionId){
                  return res.status(400).json({
                        success: false,
                        message: 'Missing Properties',
                  });
            }
            const subSection = await SubSection.findByIdAndUpdate(sectionId, {title}, {new: true});
            return res.status(200).json({
                  success: true,
                  message: 'SubSection Updated SuccessFully'
            });
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'SubSection creation failed',
                  error: error.message,
            });
      }
}
exports.deleteSubSection = async (req, res) => {
      try {
            const {SectionId} = req.params
            await Section.findByIdAndDelete(title);
            return res.status(200).json({
                  success: true,
                  message: "section Deleted Successfully",
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:'Section Deletion failed',
                  error: error.message,
            });
      }
}