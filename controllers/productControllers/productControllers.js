const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const createError = require('http-errors');
const productsCollection = db.collection("products");

//Create Product
const createProduct = async (req, res,next) => {
    try {
        const productData = req.body;
        productData.created_at = new Date();
        const result = await productsCollection.insertOne(productData);
        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
}

//Get All Product
const getAllProducts = async (req, res,next) => {
    try {
        const result = productsCollection.find().toArray();
        res.status(200).send(result);
    } catch (error) {
        next(error)
    }
}


//Get Product Data category wise 
const getProductsByCategory = async (req, res,next) => {
    const { category, subCategory } = req.params;
    try {
        const result = await productsCollection.find({category,subCategory }).toArray();
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
}

module.exports = { createProduct,getProductsByCategory,getAllProducts};