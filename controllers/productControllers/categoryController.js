const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const categoryCollection = db.collection("categories");

//Create a new category
const createCategory = async (req, res, next) => {
    try {
        const category = req.body;
        category.subCategory = [];
        const result = await categoryCollection.insertOne(category);
        res.status(201).send(result);
    } catch (error) {
        next(error)
    }
}

//Create a new sub category
const createSubCategory = async (req, res, next) => {
    try {
        const { categoryName, subCategoryName } = req.body;
        const query = { category: categoryName };
        const updateSubCategory = { $push: { subCategory: subCategoryName } }
        const result = await categoryCollection.updateOne(query, updateSubCategory);
    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createCategory,createSubCategory };