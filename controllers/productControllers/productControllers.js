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

module.exports = { createProduct };