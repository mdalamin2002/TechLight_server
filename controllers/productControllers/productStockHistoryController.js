const { client } = require("../../config/mongoDB");
const { productsCollection } = require("./productControllers");
const db = client.db("techLight");
const stockHistoryCollection = db.collection("stockHistory");


//Product increase 
const increaseStock = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { quantity, by } = req.body;
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { stock: quantity } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({ message: "Product not found" });
    }
    await stockHistoryCollection.insertOne({
      productId: new ObjectId(id),
      action: "increase",
      quantity,
      by,
      date: new Date()
    });
    res.status(200).send({ message: "Stock increased & logged" });
  } catch (error) {
    next(error);
  }
};

// products decrease
const decreaseStock = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { quantity, by } = req.body;
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).send({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock" });
    }
    await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { stock: -quantity } }
    );
    await stockHistoryCollection.insertOne({
      productId: new ObjectId(id),
      action: "decrease",
      quantity,
      by,
      date: new Date()
    });
    res.status(200).send({ message: "Stock decreased & logged" });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  increaseStock,decreaseStock
};