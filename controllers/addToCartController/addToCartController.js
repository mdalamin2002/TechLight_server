const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const cartCollection = db.collection("cart");

// Get all cart items
const getAllCart = async (req, res, next) => {
    try {
        const { email } = req.query;
        const query = email ? { userEmail: email } : {};
        const result = await cartCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllCart,
    createCart,
    updateCartQuantity,
    deleteCart,
};
