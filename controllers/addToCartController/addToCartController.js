const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const cartCollection = db.collection("cart");

// Get all cart items
const getAllCart = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).send({ message: "User email is required to fetch cart items." });
        }

        const query = { userEmail: email };
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
        cartItem.productId = String(cartItem.productId);

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

// Update quantity (increase/decrease)
const updateCartQuantity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const cartItem = await cartCollection.findOne({ _id: new ObjectId(id) });
        if (!cartItem) return res.status(404).send({ message: "Cart item not found" });

        let newQuantity = cartItem.quantity;

        if (action === "increase") newQuantity += 1;
        else if (action === "decrease" && newQuantity > 1) newQuantity -= 1;

        const result = await cartCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { quantity: newQuantity } }
        );

        res.send(result);
    } catch (error) {
        next(error);
    }
};

// Delete item from cart
const deleteCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Cart item not found" });
        }

        res.send({ message: "Cart item deleted successfully" });
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
