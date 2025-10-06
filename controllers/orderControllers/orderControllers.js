const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const ordersCollection = db.collection("orders");

//create order
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const result = await ordersCollection.insertOne(orderData);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

//Get all orders
const getAllOrders = async (req, res, next) => {
  try {
    const result = await ordersCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder,getAllOrders };
