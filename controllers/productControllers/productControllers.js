const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const createError = require("http-errors");
const productsCollection = db.collection("products");

//Create Product
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    productData.status = "active";
    productData.created_at = new Date();
    productData.updated_at = new Date();
    const result = await productsCollection.insertOne(productData);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

//Get All Product
const getAllProducts = async (req, res, next) => {
  try {
    const result = await productsCollection.find({ status: { $ne: "inactive" } }).toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Get single product
const getSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const query = { _id: new ObjectId(productId) };
    const result = await productsCollection.findOne(query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Update product
const updateProduct = async (req, res, next) => {
    try {
    const id = req.params.id;
    const updateData = req.body;
    const existingProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      return res.status(404).send({ message: "Product not found" });
    }
    updateData.updated_at = new Date();
    updateData.created_at = existingProduct.created_at;
    if (!updateData.status) {
      updateData.status = existingProduct.status; 
    }
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const query = { _id: new ObjectId(productId) };
    const updatedProduct = {
      $set: { status: "inactive" },
    };
    const result = await productsCollection.updateOne(query, updatedProduct);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Get Product Data category wise
const getProductsByCategory = async (req, res, next) => {
  const { category, subCategory } = req.params;
  try {
    const result = await productsCollection.find({ category, subCategory }).toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};




module.exports = {
  createProduct,
  getProductsByCategory,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
    updateProduct,
    productsCollection
};
