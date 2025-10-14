const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const wishlistCollection = db.collection("wishlists");

// get all wishlist
const getAllWishlists = async (req, res, next) => {
  try {
    const userEmail = req.query.userEmail;
    if (!userEmail) return res.status(400).send({ message: "userEmail is required" });
    const result = await wishlistCollection.find({ userEmail }).toArray();
    res.send(result);
  } catch (error) {
    next(error);
  }
};

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

// delete wishlist by id
const deleteWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await wishlistCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Wishlist item not found" });
    }

    res.send({ message: "Wishlist item deleted successfully" });
  } catch (error) {
    next(error);
  }
};


module.exports = { getAllWishlists, createWishlists, deleteWishlist }
