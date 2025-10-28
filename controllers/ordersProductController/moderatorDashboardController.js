const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");
const db = client.db("techLight");

const moderatorOrdersCollections = db.collection("moderator_orders");
const moderatorProductsCollections = db.collection("moderator_products");
const moderatorInventoryAlerts = db.collection("moderator_inventory-alerts");
const moderatorUsersReportsCollections = db.collection("moderator_users_reports");
const moderatorUsersReviewsCollections = db.collection("moderator_users_reviews");
const supportCollections = db.collection("support");

// GET moderator dashboard statistics
const getModeratorDashboardStats = async (req, res, next) => {
  try {
    // Get counts for different collections
    const [
      pendingOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
      pendingProductApprovalsCount,
      userReportsCount,
      flaggedReviewsCount,
      openSupportTicketsCount
    ] = await Promise.all([
      moderatorOrdersCollections.countDocuments({ status: "Pending" }),
      moderatorOrdersCollections.countDocuments({ status: "Shipped" }),
      moderatorOrdersCollections.countDocuments({ status: "Delivered" }),
      moderatorProductsCollections.countDocuments({ status: "Pending" }),
      moderatorUsersReportsCollections.countDocuments(),
      moderatorUsersReviewsCollections.countDocuments({ status: "Pending" }),
      supportCollections.countDocuments({ status: "Open" })
    ]);

    const stats = {
      pendingOrders: pendingOrdersCount,
      shippedOrders: shippedOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      pendingProductApprovals: pendingProductApprovalsCount,
      userReports: userReportsCount,
      flaggedReviews: flaggedReviewsCount,
      openSupportTickets: openSupportTicketsCount
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// GET recent activities for moderator dashboard
const getModeratorRecentActivities = async (req, res, next) => {
  try {
    // Get recent orders
    const recentOrders = await moderatorOrdersCollections
      .find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // Get recent product listings
    const recentProducts = await moderatorProductsCollections
      .find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // Get recent user reports
    const recentReports = await moderatorUsersReportsCollections
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // Combine and format activities
    const activities = [
      ...recentOrders.map(order => ({
        title: `Order ${order.id}`,
        description: "Pending approval",
        time: getTimeAgo(order.createdAt)
      })),
      ...recentProducts.map(product => ({
        title: `New product listing`,
        description: `${product.name} requires review`,
        time: getTimeAgo(product.createdAt)
      })),
      ...recentReports.map(report => ({
        title: `User report`,
        description: `${report.reason}`,
        time: getTimeAgo(report.createdAt)
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 3);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHrs > 0) {
    return `${diffHrs}h ago`;
  } else {
    return `${diffMins}m ago`;
  }
}

// GET order processing progress
const getOrderProcessingProgress = async (req, res, next) => {
  try {
    const totalOrders = await moderatorOrdersCollections.countDocuments();
    const processedOrders = await moderatorOrdersCollections.countDocuments({
      status: { $in: ["Shipped", "Delivered"] }
    });

    const progress = totalOrders > 0 
      ? Math.round((processedOrders / totalOrders) * 100) 
      : 0;

    res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getModeratorDashboardStats,
  getModeratorRecentActivities,
  getOrderProcessingProgress
};