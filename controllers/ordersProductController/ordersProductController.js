const { ObjectId } = require("mongodb");
const createError = require("http-errors");

const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const moderatorOrdersCollections = db.collection("moderator_orders");
const moderatorProductsCollections = db.collection("moderator_products");
const moderatorInventoryAlerts = db.collection("moderator_inventory-alerts");

const {
  getModeratorDashboardStats: fetchModeratorDashboardStats,
  getModeratorRecentActivities: fetchModeratorRecentActivities,
  getOrderProcessingProgress: fetchOrderProcessingProgress
} = require("./moderatorDashboardController");
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

// GET moderator dashboard statistics
const handleGetModeratorDashboardStats = async (req, res, next) => {
  try {
    const stats = await fetchModeratorDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// GET recent activities for moderator dashboard
const handleGetModeratorRecentActivities = async (req, res, next) => {
  try {
    const activities = await fetchModeratorRecentActivities();
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

// GET order processing progress
const handleGetOrderProcessingProgress = async (req, res, next) => {
  try {
    const progressData = await fetchOrderProcessingProgress();
    res.status(200).json(progressData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProductStatus,
  getInventoryAlerts,
  handleGetModeratorDashboardStats,
  handleGetModeratorRecentActivities,
  handleGetOrderProcessingProgress
};
