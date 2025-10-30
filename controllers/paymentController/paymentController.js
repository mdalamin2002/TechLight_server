// Dependencies
const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");
const SSLCommerzPayment = require("sslcommerz-lts");
const crypto = require("crypto");

// Database setup
const db = client.db("techLight");
const paymentsCollection = db.collection("payments");
const productsCollection = db.collection("products");

// Environment variables
const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASS;
const is_live = false;

// Base URLs
const backendBaseUrl = process.env.REACT_APP_PAYMENT_BACKEND_URL;
const frontendBaseUrl = process.env.REACT_APP_PAYMENT_FRONTEND_URL;

// get all Payments
const getPayments = async (req, res, next) => {
  try {
    const result = await paymentsCollection.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Update payment/order status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status
    const validStatuses = ['pending', 'success', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Add specific timestamps based on status
    if (status === 'success') {
      updateData.paidStatus = true;
      updateData.paidAt = new Date();
    } else if (status === 'failed') {
      updateData.failedAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Generate Custom IDs
function generateCustomId(prefix, length = 6) {
  const random = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, length);
  return `${prefix}-${random}`;
}

// Generate Transaction ID
function generateTransactionId() {
  const unique = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${unique}-${random}`;
}

// Create Payment
const createPayment = async (req, res) => {
  try {
    const { cart, customer, currency } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        message: "Cart is empty or invalid",
        received: { cart, customer, currency },
      });
    }

    if (!customer || !customer.email) {
      return res.status(400).json({
        message: "Customer email is required",
        received: { cart, customer, currency },
      });
    }

    try {
      cart.forEach((item) => {
        if (!item.productId)
          throw new Error(
            `Product ID missing for item: ${JSON.stringify(item)}`
          );
        if (!item.quantity || item.quantity < 1)
          throw new Error(`Invalid quantity for item: ${JSON.stringify(item)}`);
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message, received: { cart, customer, currency } });
    }

    // Convert productIds to ObjectId
    let productIds;
    try {
      productIds = cart.map((item) => new ObjectId(item.productId));
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message, received: { cart, customer, currency } });
    }

    const products = await productsCollection
      .find({ _id: { $in: productIds }, status: "approved" }) // Only process approved products
      .toArray();

    if (!products.length) {
      return res.status(404).json({
        message: "Products not found or not approved",
      });
    }

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p._id.toString());
      const missingIds = productIds.filter(
        (id) => !foundIds.includes(id.toString())
      );
      return res.status(404).json({
        message: "Some products are no longer available",
        missingProducts: missingIds.map((id) => id.toString()),
        availableProducts: foundIds,
      });
    }

    const totalAmount = cart.reduce((sum, item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return sum + (product?.price || 0) * (item.quantity || 1);
    }, 0);

    const tran_id = generateTransactionId();
    const order_id = generateCustomId("ORD");

    const data = {
      total_amount: totalAmount,
      currency: currency || "BDT",
      tran_id,
      success_url: `${backendBaseUrl}/success/${tran_id}`,
      fail_url: `${backendBaseUrl}/fail/${tran_id}`,
      cancel_url: `${backendBaseUrl}/cancel/${tran_id}`,
      ipn_url: `${backendBaseUrl}/ipn/${tran_id}`,
      shipping_method: "Courier",
      product_name: "Multiple Products",
      product_category: "General",
      product_profile: "general",
      payment_method: "SSLCommerz",
      cus_name: customer.name,
      cus_email: customer.email || "customer@example.com",
      cus_phone: customer.phone,
      cus_add1: customer.address,
      cus_city: customer.city,
      cus_postcode: customer.postal || "1000",
      cus_country: customer.country || "Bangladesh",
      ship_name: customer.name,
      ship_add1: customer.address,
      ship_city: customer.city,
      ship_postcode: customer.postal || "1000",
      ship_country: customer.country || "Bangladesh",
      order_id,
      customer_id: customer.id || null,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      browser_fingerprint: crypto.randomBytes(8).toString("hex"),
      createdAt: new Date(),
    };

    if (!store_id || !store_passwd) {
      return res
        .status(500)
        .json({ message: "Payment gateway configuration error" });
    }

    let apiResponse;
    try {
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const initPromise = sslcz.init(data);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("SSLCommerz initialization timeout")),
          30000
        )
      );
      apiResponse = await Promise.race([initPromise, timeoutPromise]);
    } catch (err) {
      return res
        .status(500)
        .json({
          message: "Payment gateway initialization failed",
          error: err.message,
        });
    }

    if (!apiResponse?.GatewayPageURL) {
      return res
        .status(400)
        .json({
          message: "Failed to initialize payment session",
          response: apiResponse,
        });
    }

    const paymentDoc = {
      order_id,
      tran_id,
      products: cart.map((item) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity || 1,
          price: product?.price || 0,
          name: item.name,
          // Include seller information
          seller: product?.createdBy || null
        };
      }),
      customer,
      status: "pending",
      paidStatus: false,
      total_amount: totalAmount,
      payment_method: "SSLCommerz",
      currency: currency || "BDT",
      gateway_response: apiResponse,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      browser_fingerprint: data.browser_fingerprint,
      createdAt: new Date(),
    };

    await paymentsCollection.insertOne(paymentDoc);

    res
      .status(200)
      .json({ url: apiResponse.GatewayPageURL, order_id, tran_id });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Payment Success
const paymentSuccess = async (req, res) => {
  try {
    const tran_id = req.params.tranId;

    // Get the payment record to access seller information
    const paymentRecord = await paymentsCollection.findOne({ tran_id });

    const updateData = {
      paidStatus: true,
      status: "success",
      verified: true,
      paidAt: new Date(),
      updatedAt: new Date(),
    };

    // If we have seller information, we can use it for notifications or other purposes
    if (paymentRecord && paymentRecord.products) {
      // Seller information is already stored in the products array
      // This can be used for sending notifications to sellers
      updateData.sellers = paymentRecord.products
        .map(product => product.seller)
        .filter((seller, index, self) =>
          seller && self.findIndex(s => s && s.email === seller.email) === index);
    }

    const result = await paymentsCollection.updateOne(
      { tran_id },
      { $set: updateData }
    );

    if (result.modifiedCount > 0)
      return res.redirect(`${frontendBaseUrl}/success/${tran_id}`);
    res
      .status(404)
      .json({ message: "Transaction not found or already updated" });
  } catch {
    res.status(500).json({ message: "Server error in success route" });
  }
};

// Payment Fail
const paymentFail = async (req, res) => {
  try {
    const tran_id = req.params.tranId;

    // Get the payment record to access seller information
    const paymentRecord = await paymentsCollection.findOne({ tran_id });

    const updateData = {
      status: "failed",
      failedAt: new Date(),
      updatedAt: new Date(),
    };

    // Preserve seller information if it exists
    if (paymentRecord && paymentRecord.sellers) {
      updateData.sellers = paymentRecord.sellers;
    }

    await paymentsCollection.updateOne(
      { tran_id },
      { $set: updateData }
    );
    res.redirect(`${frontendBaseUrl}/fail/${tran_id}`);
  } catch {
    res.status(500).json({ message: "Server error in fail route" });
  }
};

// Payment Cancel
const paymentCancel = async (req, res) => {
  try {
    const tran_id = req.params.tranId;

    // Get the payment record to access seller information
    const paymentRecord = await paymentsCollection.findOne({ tran_id });

    const updateData = {
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date(),
    };

    // Preserve seller information if it exists
    if (paymentRecord && paymentRecord.sellers) {
      updateData.sellers = paymentRecord.sellers;
    }

    await paymentsCollection.updateOne(
      { tran_id },
      { $set: updateData }
    );
    res.redirect(`${frontendBaseUrl}/cancel/${tran_id}`);
  } catch {
    res.status(500).json({ message: "Server error in cancel route" });
  }
};

// Test Payment
const testPayment = async (req, res) => {
  res.json({ message: "Test endpoint working", received: req.body });
};

// Get Payment Details
const getPaymentDetails = async (req, res) => {
  try {
    const { tranId } = req.params;
    if (!tranId)
      return res.status(400).json({ message: "Transaction ID is required" });

    const payment = await paymentsCollection.findOne({ tran_id: tranId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json(payment);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get User Payments (All orders for logged-in user)
const getUserPayments = async (req, res) => {
  try {
    const userEmail = req.user?.email; // From verifyToken middleware

    if (!userEmail) {
      return res.status(401).json({ message: "User email not found" });
    }

    // Get query parameters for filtering and pagination
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { "customer.email": userEmail };
    if (status && status !== "all") {
      query.status = status;
    }

    // Fetch payments with pagination
    const payments = await paymentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const totalCount = await paymentsCollection.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check Products
const checkProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    const objectIds = productIds.map((id) => new ObjectId(id));
    const products = await productsCollection
      .find({ _id: { $in: objectIds }, status: "approved" }) // Only check approved products
      .toArray();

    res.json({
      requested: productIds,
      found: products.map((p) => p._id.toString()),
      missing: productIds.filter(
        (id) => !products.some((p) => p._id.toString() === id)
      ),
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error checking products", error: err.message });
  }
};

// Get all payments for admin with filters and pagination
const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch payments with pagination
    const payments = await paymentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const totalCount = await paymentsCollection.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get payment statistics for admin dashboard
const getPaymentStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Total revenue (successful payments)
    const revenueResult = await paymentsCollection.aggregate([
      { $match: { status: 'success', paidStatus: true } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total transactions
    const totalTransactions = await paymentsCollection.countDocuments();

    // Successful transactions
    const successfulTransactions = await paymentsCollection.countDocuments({ status: 'success' });

    // Failed transactions
    const failedTransactions = await paymentsCollection.countDocuments({ status: 'failed' });

    // Pending transactions
    const pendingTransactions = await paymentsCollection.countDocuments({ status: 'pending' });

    // Recent period revenue
    const recentRevenueResult = await paymentsCollection.aggregate([
      { $match: { status: 'success', paidStatus: true, createdAt: { $gte: daysAgo } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]).toArray();
    const recentRevenue = recentRevenueResult[0]?.total || 0;

    // Previous period revenue for comparison
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));
    const previousRevenueResult = await paymentsCollection.aggregate([
      { $match: { status: 'success', paidStatus: true, createdAt: { $gte: previousPeriodStart, $lt: daysAgo } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]).toArray();
    const previousRevenue = previousRevenueResult[0]?.total || 0;

    // Calculate revenue growth percentage
    const revenueGrowth = previousRevenue > 0
      ? (((recentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 100;

    // Recent transactions count
    const recentTransactions = await paymentsCollection.countDocuments({ createdAt: { $gte: daysAgo } });
    const previousTransactions = await paymentsCollection.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
    });
    const transactionGrowth = previousTransactions > 0
      ? (((recentTransactions - previousTransactions) / previousTransactions) * 100).toFixed(1)
      : 100;

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        recentRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        transactionGrowth: parseFloat(transactionGrowth),
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getPayments,
  updatePaymentStatus,
  createPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  testPayment,
  getPaymentDetails,
  getUserPayments,
  checkProducts,
  getAllPayments,
  getPaymentStats,
};
