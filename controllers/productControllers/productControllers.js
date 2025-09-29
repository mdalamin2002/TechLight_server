const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const productsCollection = db.collection("products");

//Create Product
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        productData.created_at = new Date();
        const result = await productsCollection.insertOne(productData);
        res.status(201).send(result)
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}

//Get All Product
const getAllProducts = async (req, res) => {
    try {
        const result = productsCollection.find().toArray();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"})
    }
}


//Get Product Data category wise 
const getProductsByCategory = async (req, res) => {
    const { category, subCategory } = req.params;
    try {
        const result = await productsCollection.find({category,subCategory }).toArray();
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"})
    }
}

module.exports = { createProduct,getProductsByCategory,getAllProducts};