const { ObjectId } = require("mongodb");
const createError = require("http-errors");

const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const moderatorOrdersCollections = db.collection("moderator_orders");
const moderatorProductsCollections = db.collection("moderator_products");
const moderatorInventoryAlerts = db.collection("moderator_inventory-alerts");
// GET all orders
const getOrders = async (req, res, next) => {
  try {
    const result = await moderatorOrdersCollections.find().toArray();
    res.status(200).json(result);
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


// GET all products (for review)
const getProducts = async (req, res, next) => {
  try {
    const result = await moderatorProductsCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PATCH: Update product status (Approve/Reject)
const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return next(createError(400, "Status is required"));

    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    if (!allowedStatuses.includes(status))
      return next(createError(400, "Invalid status value"));

    const result = await moderatorProductsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0)
      return next(createError(404, "Product not found"));

    res.status(200).json({ message: "Product status updated successfully" });
  } catch (error) {
    next(error);
  }
};

// GET all inventory alerts
const getInventoryAlerts = async (req, res, next) => {
  try {
    const result = await moderatorInventoryAlerts.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProductStatus,
  getInventoryAlerts
};
