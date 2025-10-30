const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const createError = require("http-errors");
const productReviewsCollection = db.collection("productReviews");
const productsCollection = db.collection("products");

// Create a new product review
const createProductReview = async (req, res, next) => {
  try {
    const reviewData = req.body;
    const { productId, rating, title, comment } = reviewData;
    const userEmail = req.user?.email;
    const userName = req.user?.displayName || "Anonymous"; // Use displayName from auth middleware

    console.log("Creating review for user:", { userEmail, userName }); // Debug log

    // Validate required fields
    if (!productId || !rating || !title || !comment) {
      return next(createError(400, "All fields are required"));
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return next(createError(400, "Rating must be between 1 and 5"));
    }

    // Check if user already reviewed this product
    const existingReview = await productReviewsCollection.findOne({
      productId: new ObjectId(productId),
      userEmail: userEmail
    });

    if (existingReview) {
      return next(createError(400, "You have already reviewed this product"));
    }

    const newReview = {
      productId: new ObjectId(productId),
      userEmail: userEmail,
      userName: userName,
      userPhotoURL: req.user?.photoURL || null, // Add profile picture
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      helpful: 0,
      helpfulUsers: [], // Track who liked the review
      verified: true,
      status: "approved", // Auto-approve for now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await productReviewsCollection.insertOne(newReview);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: { ...newReview, _id: result.insertedId }
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a specific product
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    if (!ObjectId.isValid(productId)) {
      return next(createError(400, "Invalid product ID"));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [reviews, total] = await Promise.all([
      productReviewsCollection
        .find({
          productId: new ObjectId(productId),
          status: "approved"
        })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      productReviewsCollection.countDocuments({
        productId: new ObjectId(productId),
        status: "approved"
      })
    ]);

    // Calculate average rating
    const avgRatingResult = await productReviewsCollection.aggregate([
      { $match: { productId: new ObjectId(productId), status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ]).toArray();

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
    const totalReviews = avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0;

    // Rating distribution
    const ratingDistribution = await productReviewsCollection.aggregate([
      { $match: { productId: new ObjectId(productId), status: "approved" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]).toArray();

    const distribution = [5, 4, 3, 2, 1].map(star => {
      const found = ratingDistribution.find(r => r._id === star);
      return {
        star,
        count: found ? found.count : 0,
        percentage: totalReviews > 0 ? ((found ? found.count : 0) / totalReviews) * 100 : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: {
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
          ratingDistribution: distribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a product review
const updateProductReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userEmail = req.user?.email; // Fix: Use email instead of userId

    if (!ObjectId.isValid(reviewId)) {
      return next(createError(400, "Invalid review ID"));
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return next(createError(400, "Rating must be between 1 and 5"));
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (rating) updateData.rating = parseInt(rating);
    if (title) updateData.title = title.trim();
    if (comment) updateData.comment = comment.trim();

    const result = await productReviewsCollection.updateOne(
      {
        _id: new ObjectId(reviewId),
        userEmail: userEmail // Fix: Use userEmail instead of userId
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return next(createError(404, "Review not found or you don't have permission to update it"));
    }

    if (result.modifiedCount === 0) {
      return next(createError(400, "No changes made"));
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product review
const deleteProductReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userEmail = req.user?.email; // Fix: Use email instead of userId

    if (!ObjectId.isValid(reviewId)) {
      return next(createError(400, "Invalid review ID"));
    }

    const result = await productReviewsCollection.deleteOne({
      _id: new ObjectId(reviewId),
      userEmail: userEmail // Fix: Use userEmail instead of userId
    });

    if (result.deletedCount === 0) {
      return next(createError(404, "Review not found or you don't have permission to delete it"));
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Mark review as helpful
const markReviewHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userEmail = req.user?.email; // Get user email from auth

    if (!ObjectId.isValid(reviewId)) {
      return next(createError(400, "Invalid review ID"));
    }

    // First, get the review to check if user is trying to like their own review
    const review = await productReviewsCollection.findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    // Check if user is trying to like their own review
    if (review.userEmail === userEmail) {
      return next(createError(400, "You cannot like your own review"));
    }

    // Check if user already liked this review
    if (review.helpfulUsers && review.helpfulUsers.includes(userEmail)) {
      return next(createError(400, "You have already liked this review"));
    }

    // Add user to helpfulUsers array and increment helpful count
    const result = await productReviewsCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $inc: { helpful: 1 },
        $push: { helpfulUsers: userEmail }
      }
    );

    if (result.matchedCount === 0) {
      return next(createError(404, "Review not found"));
    }

    res.status(200).json({
      success: true,
      message: "Review marked as helpful"
    });
  } catch (error) {
    next(error);
  }
};

// Get user's review for a specific product
const getUserProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userEmail = req.user?.email; // Fix: Use email instead of userId

    if (!ObjectId.isValid(productId)) {
      return next(createError(400, "Invalid product ID"));
    }

    const review = await productReviewsCollection.findOne({
      productId: new ObjectId(productId),
      userEmail: userEmail // Fix: Use userEmail instead of userId
    });

    res.status(200).json({
      success: true,
      data: review || null
    });
  } catch (error) {
    next(error);
  }
};

// Get all approved reviews for homepage
const getAllApprovedReviews = async (req, res, next) => {
  try {
    const { limit = 12 } = req.query;

    console.log("Fetching reviews from database...");
    const reviews = await productReviewsCollection
      .find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    console.log("Found reviews:", reviews.length);

    // Get product details for each review - ONLY APPROVED PRODUCTS
    const productIds = reviews.map(review => review.productId);
    const products = await productsCollection
      .find({ _id: { $in: productIds }, status: "approved" })
      .toArray();

    // Create a map of products for quick lookup
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    // Combine review data with product information
    const enrichedReviews = reviews.map(review => {
      const product = productMap[review.productId.toString()];
      return {
        _id: review._id,
        userName: review.userName || "Anonymous",
        userPhotoURL: review.userPhotoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 1}`,
        rating: review.rating,
        createdAt: review.createdAt,
        comment: review.comment || review.title || "Great product!",
        productName: product ? product.name : "Unknown Product",
        helpful: review.helpful || 0,
        verified: review.verified || true,
        status: review.status || "approved" // Include the actual status from the database
      };
    });

    console.log("Sending response with reviews:", enrichedReviews.length);
    res.status(200).json({
      success: true,
      data: enrichedReviews,
      total: enrichedReviews.length
    });

  } catch (error) {
    next(error);
  }
};

// Get all reviews for homepage (for moderators)
const getAllReviewsForModerator = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query; // Increase limit for moderators

    // For moderators, fetch all reviews regardless of status
    const reviews = await productReviewsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // Get product details for each review - ONLY APPROVED PRODUCTS
    const productIds = reviews.map(review => review.productId);
    const products = await productsCollection
      .find({ _id: { $in: productIds }, status: "approved" })
      .toArray();

    // Create a map of products for quick lookup
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    // Combine review data with product information
    const enrichedReviews = reviews.map(review => {
      const product = productMap[review.productId.toString()];
      return {
        _id: review._id,
        userName: review.userName || "Anonymous",
        userPhotoURL: review.userPhotoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 1}`,
        rating: review.rating,
        createdAt: review.createdAt,
        comment: review.comment || review.title || "Great product!",
        productName: product ? product.name : "Unknown Product",
        helpful: review.helpful || 0,
        verified: review.verified || true,
        status: review.status || "approved" // Include the actual status from the database
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedReviews,
      total: enrichedReviews.length
    });

  } catch (error) {
    next(error);
  }
};

// Update review status (for moderators)
const updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(reviewId)) {
      return next(createError(400, "Invalid review ID"));
    }

    // Validate status - convert to lowercase for consistency
    const validStatuses = ["approved", "pending", "rejected"];
    const normalizedStatus = status.toLowerCase();

    if (!validStatuses.includes(normalizedStatus)) {
      return next(createError(400, "Invalid status value"));
    }

    const result = await productReviewsCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { status: normalizedStatus, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return next(createError(404, "Review not found"));
    }

    res.status(200).json({
      success: true,
      message: `Review ${normalizedStatus} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product review (for moderators)
const deleteReviewByModerator = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return next(createError(400, "Invalid review ID"));
    }

    const result = await productReviewsCollection.deleteOne({
      _id: new ObjectId(reviewId)
    });

    if (result.deletedCount === 0) {
      return next(createError(404, "Review not found"));
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getUserProductReview,
  getAllApprovedReviews,
  getAllReviewsForModerator, // Add this new function
  updateReviewStatus,
  deleteReviewByModerator
};
