const { ObjectId } = require("mongodb");
const createError = require("http-errors");

const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const moderatorOrdersCollections = db.collection("moderator_orders");

// GET all orders
const getAllOrders = async (req, res, next) => {
  try {
    const result = await moderatorOrdersCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return next(createError(400, "Invalid order ID"));
    }

    const order = await moderatorOrdersCollections.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return next(createError(404, "Order not found"));
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// PATCH: Update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return next(createError(400, "Status is required"));

    if (!ObjectId.isValid(id)) {
      return next(createError(400, "Invalid order ID"));
    }

    const result = await moderatorOrdersCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0)
      return next(createError(404, "Order not found"));

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove order
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return next(createError(400, "Invalid order ID"));
    }

    const result = await moderatorOrdersCollections.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return next(createError(404, "Order not found"));
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
