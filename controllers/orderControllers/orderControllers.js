const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const ordersCollection = db.collection("orders");

//create order
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    // Add timestamp
    orderData.createdAt = new Date();
    orderData.updatedAt = new Date();

    // If products are included, ensure seller information is preserved
    if (orderData.products && Array.isArray(orderData.products)) {
      // Add seller information to each product if not already present
      orderData.products = orderData.products.map(product => {
        // Seller information should come from the product data
        // This assumes products have been fetched with seller info
        return {
          ...product,
          seller: product.seller || product.createdBy || null
        };
      });

      // Extract unique sellers from products
      orderData.sellers = orderData.products
        .map(product => product.seller)
        .filter((seller, index, self) =>
          seller && self.findIndex(s => s && s.email === seller.email) === index);
    }

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

// Get user's order history with pagination and filtering
const getUserOrders = async (req, res, next) => {
  try {
    const userEmail = req.decoded; // From auth middleware
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query filter
    const filter = { userEmail };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [orders, totalCount] = await Promise.all([
      ordersCollection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      ordersCollection.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    next(error);
  }
};

// Get single order details for user
const getUserOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userEmail = req.decoded;

    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      userEmail
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    next(error);
  }
};

// Get order statistics for user
const getUserOrderStats = async (req, res, next) => {
  try {
    const userEmail = req.decoded;

    const pipeline = [
      { $match: { userEmail } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
          }
        }
      }
    ];

    const stats = await ordersCollection.aggregate(pipeline).toArray();

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalAmount: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0
      }
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    next(error);
  }
};

// Get seller's orders with pagination
const getSellerOrders = async (req, res, next) => {
  try {
    const sellerEmail = req.decoded; // From auth middleware (req.decoded contains the email)
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query filter for seller orders
    // Seller information is stored in the payments collection in the "products.seller.email" field
    const filter = { 
      "products.seller.email": sellerEmail,
      status: { $ne: "pending" } // Exclude pending orders
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments collection (since seller info is stored there)
    const paymentsCollection = db.collection("payments");

    // Execute query with pagination
    const [orders, totalCount] = await Promise.all([
      paymentsCollection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      paymentsCollection.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getUserOrderById,
  getUserOrderStats,
  getSellerOrders
};
