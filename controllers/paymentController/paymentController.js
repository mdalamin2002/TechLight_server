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
const is_live = false; // true for production, false for testing

// Helper: Generate Custom IDs
function generateCustomId(prefix, length = 6) {
  const random = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, length);
  return `${prefix}-${random}`;
}

// Helper: Generate Transaction ID (Timestamp + Random)
function generateTransactionId() {
  const unique = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${unique}-${random}`;
}

// Create Payment
const createPayment = async (req, res) => {
  try {
    // Step 1: Validate Product
    const product = await productsCollection.findOne({
      _id: new ObjectId(req.body.productId),
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Generate IDs
    const tran_id = generateTransactionId();
    const order_id = generateCustomId("ORD");

    // Step 3: Collect order info
    const order = {
      ...req.body,
      order_id,
      tran_id,
      status: "pending",
      createdAt: new Date(),
      ip_address: req.ip,
      user_agent: req.headers["user-agent"] || "Unknown",
    };

    // Step 4: SSLCommerz Data
    const data = {
      total_amount: product.price,
      currency: order.currency || "BDT",
      tran_id,
      success_url: `http://localhost:5000/api/payments/success/${tran_id}`,
      fail_url: `http://localhost:5000/api/payments/fail/${tran_id}`,
      cancel_url: `http://localhost:5000/api/payments/cancel/${tran_id}`,
      ipn_url: `http://localhost:5000/api/payments/ipn/${tran_id}`,
      shipping_method: "Courier",
      product_name: product.name,
      product_category: product.category || "General",
      product_profile: "general",
      payment_method: "SSLCommerz",

      // Product Info
      product_id: product._id,
      quantity: order.quantity || 1,
      order_note: order.note || "",

      // Customer Info
      cus_name: order.customerName,
      cus_email: order.customerEmail || "customer@example.com",
      cus_phone: order.phone,
      cus_add1: order.address,
      cus_city: order.city,
      cus_country: order.country || "Bangladesh",

      // Shipping Info
      ship_name: order.customerName,
      ship_add1: order.address,
      ship_city: order.city,
      ship_country: order.country || "Bangladesh",

      // Metadata & Tracking
      order_id,
      customer_id: order.customerId || null,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      browser_fingerprint: crypto.randomBytes(8).toString("hex"),

      // Timestamps
      createdAt: new Date(),
      updatedAt: null,
      verifiedAt: null,
      paidAt: null,
      failedAt: null,
      cancelledAt: null,
    };

    // Step 5: Initialize Payment Gateway
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (!apiResponse?.GatewayPageURL) {
      return res.status(400).json({ message: "Failed to initialize payment session" });
    }

    // Step 6: Save Initial Payment Data
    const paymentDoc = {
      order_id,
      tran_id,
      product,
      customer: order,
      status: "pending",
      paidStatus: false,
      createdAt: new Date(),

      // Refund & Reporting Fields
      refund_id: null,
      refund_status: "none",
      refund_reason: "",
      refund_requested_at: null,
      refund_completed_at: null,

      // Audit & Security Fields
      verified: false,
      gateway_response: apiResponse,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      browser_fingerprint: data.browser_fingerprint,

      // Analytics
      total_amount: product.price,
      payment_method: "SSLCommerz",
      currency: "BDT",
      region: order.country || "Bangladesh",
    };

    await paymentsCollection.insertOne(paymentDoc);

    console.log(` Payment session created: ${tran_id}`);
    res.status(200).json({
      url: apiResponse.GatewayPageURL,
      order_id,
      tran_id,
    });
  } catch (error) {
    console.error(" Payment initiation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Payment Success
const paymentSuccess = async (req, res) => {
  try {
    const tran_id = req.params.tranId;

    const result = await paymentsCollection.updateOne(
      { tran_id },
      {
        $set: {
          paidStatus: true,
          status: "success",
          verified: true,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(` Payment Successful: ${tran_id}`);
      return res.redirect(`http://localhost:5173/payment/success/${tran_id}`);
    }

    res.status(404).json({ message: "Transaction not found or already updated" });
  } catch (error) {
    console.error("Success handler error:", error);
    res.status(500).json({ message: "Server error in success route" });
  }
};

// Payment Fail
const paymentFail = async (req, res) => {
  try {
    const tran_id = req.params.tranId;
    await paymentsCollection.updateOne(
      { tran_id },
      { $set: { status: "failed", failedAt: new Date(), updatedAt: new Date() } }
    );
    console.log(` Payment Failed: ${tran_id}`);
    res.redirect(`http://localhost:5173/payment/fail/${tran_id}`);
  } catch (error) {
    console.error("Fail handler error:", error);
    res.status(500).json({ message: "Server error in fail route" });
  }
};

//  Payment Cancel
const paymentCancel = async (req, res) => {
  try {
    const tran_id = req.params.tranId;
    await paymentsCollection.updateOne(
      { tran_id },
      { $set: { status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() } }
    );
    console.log(`Payment Cancelled: ${tran_id}`);
    res.redirect(`http://localhost:5173/payment/cancel/${tran_id}`);
  } catch (error) {
    console.error("Cancel handler error:", error);
    res.status(500).json({ message: "Server error in cancel route" });
  }
};

module.exports = {
  createPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
};
