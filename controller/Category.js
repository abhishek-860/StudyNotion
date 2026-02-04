const Category = require("../models/Category");
const Tag = require("../models/Category");
const { Mongoose } = require("mongoose");
function getRandomInt(max) {
      return Math.floor(Math.random() * max)
}
exports.createCategory = async (req, res) => {
      try {
            const {name, description} = req.body;
            if(!name || !description){
                  return res.status(400).json({
                        success: false,
                        message:'All fields required',
                  });
            }
            const categoryDetails = await Category.create({
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
            const allCategory = await Category.find({}, {name:true, description:true});
            res.status(200).json({
                  success:true,
                  message:"All Category returned successfully",
                  data: allCategory,
            })
      } catch (error) {
            return res.status(500).json({
                  success: false,
                  message: error.message,
            });
      }
};
exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      if (selectedCategory.course.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
        })
        .exec()
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }