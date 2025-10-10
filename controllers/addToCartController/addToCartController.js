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

// Add to cart
const createCart = async (req, res, next) => {
    try {
        const cartItem = req.body;

        const exists = await cartCollection.findOne({
            productId: cartItem.productId,
            userEmail: cartItem.userEmail,
        });

        if (exists) {
            return res.status(400).send({ message: "Item already in cart" });
        }

        const result = await cartCollection.insertOne(cartItem);
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
