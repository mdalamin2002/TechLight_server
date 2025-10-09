const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const wishlistCollection = db.collection("wishlists");

// get all wishlist
const getAllWishlists = async (req, res, next) => {
    try {
        const result = await wishlistCollection.find().toArray()
        res.send(result)
    } catch (error) {
        next(error)
    }
}

// create a new wishlist
const createWishlists = async (req, res, next) => {
    try {
        const wishlist = req.body;
        console.log(wishlist);
        const result = await wishlistCollection.insertOne(wishlist)
        res.send(result)
    } catch (error) {
        next(error)
    }
}




module.exports = { getAllWishlists, createWishlists }
