const Tag = require("../models/Category");
exports.createCategory = async (req, res) => {
      try {
            const {name, description} = req.body;
            if(!name || !description){
                  return res.status(400).json({
                        success: false,
                        message:'All fields required',
                  });
            }
            const categoryDetails = await Tag.create({
                  name: name,
                  description:description,
            });
            console.log(categoryDetails);
            return res.status(200).json({
                  success: true,
                  message:"Category created successfully", 
            });
            
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message:error.message,
            })
      }
};
exports.showAllCategory = async (req, res) => {
      try {
            const allCategory = await Tag.find({}, {name:true, description:true});
            res.status(200).json({
                  success:true,
                  message:"All Category returned successfully",
                  allCategory,
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message: error.message,
            });
      }
}