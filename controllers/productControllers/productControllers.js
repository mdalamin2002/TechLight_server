const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const createError = require("http-errors");
const productsCollection = db.collection("products");
const productReviewsCollection = db.collection("productReviews"); // Add reviews collection
const paymentsCollection = db.collection("payments"); // Add payments collection

//Create Product
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    // Set the product status to "pending" by default
    productData.status = "pending";
    productData.created_at = new Date();
    productData.updated_at = new Date();
    // Associate product with the user who created it
    productData.createdBy = {
      email: req.decoded, // This is the user's email from auth middleware
      uid: req.user?.uid,
      name: req.user?.displayName || 'Unknown Seller',
      photoURL: req.user?.photoURL || null
    };
    const result = await productsCollection.insertOne(productData);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

//Get All Product (with pagination)
const getAllProducts = async (req, res, next) => {
  try {
    // Check if all products should be returned (no pagination)
    const returnAll = req.query.all === 'true';

    if (returnAll) {
      // Return all products without pagination - ONLY APPROVED PRODUCTS
      const filter = { status: "approved" };
      const items = await productsCollection.find(filter).toArray();

      // Add dynamic ratings to all products
      if (items.length > 0) {
        // Get all product IDs
        const productIds = items.map(item => item._id);

        // Get reviews for all these products
        const reviews = await productReviewsCollection
          .find({
            productId: { $in: productIds },
            status: "approved"
          })
          .toArray();

        // Group reviews by product ID
        const reviewsByProduct = {};
        reviews.forEach(review => {
          const productId = review.productId.toString();
          if (!reviewsByProduct[productId]) {
            reviewsByProduct[productId] = [];
          }
          reviewsByProduct[productId].push(review);
        });

        // Calculate dynamic ratings for each product
        items.forEach(item => {
          const productId = item._id.toString();
          const productReviews = reviewsByProduct[productId] || [];

          if (productReviews.length > 0) {
            // Calculate average rating
            const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / productReviews.length;

            // Add dynamic rating and total reviews to product data
            item.rating = parseFloat(averageRating.toFixed(1));
            item.totalReviews = productReviews.length;
          }
        });
      }

      res.status(200).send({ data: items, total: items.length });
    } else {
      // Original pagination logic - ONLY APPROVED PRODUCTS
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
      const skip = (page - 1) * limit;

      const filter = { status: "approved" };
      const [items, total] = await Promise.all([
        productsCollection
          .find(filter)
          .skip(skip)
          .limit(limit)
          .toArray(),
        productsCollection.countDocuments(filter),
      ]);

      // Add dynamic ratings to all products
      if (items.length > 0) {
        // Get all product IDs
        const productIds = items.map(item => item._id);

        // Get reviews for all these products
        const reviews = await productReviewsCollection
          .find({
            productId: { $in: productIds },
            status: "approved"
          })
          .toArray();

        // Group reviews by product ID
        const reviewsByProduct = {};
        reviews.forEach(review => {
          const productId = review.productId.toString();
          if (!reviewsByProduct[productId]) {
            reviewsByProduct[productId] = [];
          }
          reviewsByProduct[productId].push(review);
        });

        // Calculate dynamic ratings for each product
        items.forEach(item => {
          const productId = item._id.toString();
          const productReviews = reviewsByProduct[productId] || [];

          if (productReviews.length > 0) {
            // Calculate average rating
            const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / productReviews.length;

            // Add dynamic rating and total reviews to product data
            item.rating = parseFloat(averageRating.toFixed(1));
            item.totalReviews = productReviews.length;
          }
        });
      }

      res.status(200).send({ data: items, page, limit, total });
    }
  } catch (error) {
    next(error);
  }
};

//Get single product
const getSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return next(createError(400, 'Invalid product id'));
    }
    const query = { _id: new ObjectId(productId) };
    const result = await productsCollection.findOne(query);
    if (!result) {
      return next(createError(404, 'Product not found'));
    }

    // Calculate dynamic rating based on reviews
    const reviews = await productReviewsCollection
      .find({ productId: new ObjectId(productId), status: "approved" })
      .toArray();

    if (reviews.length > 0) {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Add dynamic rating and total reviews to product data
      result.rating = parseFloat(averageRating.toFixed(1));
      result.totalReviews = reviews.length;
    }

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Update product
const updateProduct = async (req, res, next) => {
    try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid product id'));
    }
    const updateData = req.body;
    const existingProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      return next(createError(404, 'Product not found'));
    }
    updateData.updated_at = new Date();
    updateData.created_at = existingProduct.created_at;
    // Preserve seller information
    updateData.createdBy = existingProduct.createdBy;
    if (!updateData.status) {
      updateData.status = existingProduct.status;
    }
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return next(createError(400, 'Invalid product id'));
    }
    const query = { _id: new ObjectId(productId) };
    const updatedProduct = {
      $set: { status: "inactive" },
    };
    const result = await productsCollection.updateOne(query, updatedProduct);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Get Product Data category and subcategory wise
const getProductsByCategory = async (req, res, next) => {
  const { category, subCategory } = req.params;
  try {
    const result = await productsCollection.find({ category, subCategory, status: "approved" }).toArray();

    // Add dynamic ratings to products in this category
    if (result.length > 0) {
      // Get all product IDs
      const productIds = result.map(item => item._id);

      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: productIds },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      result.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }
      });
    }

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Get Product Data category wise
const getProductsByOnlyCategory = async (req, res, next) => {
  const { category } = req.params;
  try {
    const result = await productsCollection.find({ category:category, status: "approved" }).toArray();

    // Add dynamic ratings to products in this category
    if (result.length > 0) {
      // Get all product IDs
      const productIds = result.map(item => item._id);

      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: productIds },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      result.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }
      });
    }

    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

//Get Top Selling Products based on sales volume
const getTopSellingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 4; // Default to 4 products

    // First, get all successful payments
    const successfulPayments = await paymentsCollection
      .find({ status: "success", paidStatus: true })
      .toArray();

    // Calculate sales quantities for each product
    const productSales = {};
    successfulPayments.forEach(payment => {
      if (payment.products && Array.isArray(payment.products)) {
        payment.products.forEach(product => {
          if (product.productId) {
            if (!productSales[product.productId]) {
              productSales[product.productId] = {
                totalQuantitySold: 0,
                totalRevenue: 0
              };
            }
            const quantity = parseInt(product.quantity) || 0;
            const price = parseFloat(product.price) || 0;
            productSales[product.productId].totalQuantitySold += quantity;
            productSales[product.productId].totalRevenue += quantity * price;
          }
        });
      }
    });

    // Convert to array and sort by quantity sold
    const salesArray = Object.entries(productSales)
      .map(([productId, salesData]) => ({
        productId,
        ...salesData
      }))
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, limit);

    // Get product details for the top selling products - ONLY APPROVED PRODUCTS
    const productIds = salesArray.map(item => new ObjectId(item.productId));
    const products = await productsCollection
      .find({ _id: { $in: productIds }, status: "approved" })
      .toArray();

    // Combine sales data with product details
    const topProducts = salesArray.map(sale => {
      const product = products.find(p => p._id.toString() === sale.productId);
      if (!product) return null;

      return {
        ...product,
        totalQuantitySold: sale.totalQuantitySold,
        totalRevenue: sale.totalRevenue
      };
    }).filter(Boolean); // Remove any null entries

    // Add dynamic ratings to all products
    if (topProducts.length > 0) {
      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: topProducts.map(p => p._id) },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      topProducts.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }
      });
    }

    res.status(200).send({ data: topProducts, limit });
  } catch (error) {
    next(error);
  }
};

//Get High Rated Products (rating >= 4.0)
const getHighRatedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 4; // Default to 4 products

    // Get all products with status approved
    const products = await productsCollection
      .find({ status: "approved" })
      .toArray();

    // Add dynamic ratings to all products
    if (products.length > 0) {
      // Get all product IDs
      const productIds = products.map(item => item._id);

      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: productIds },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      products.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }
      });
    }

    // Filter products with rating >= 4.0 and sort by rating (highest first)
    const highRatedProducts = products
      .filter(product => product.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    res.status(200).send({ data: highRatedProducts, limit });
  } catch (error) {
    next(error);
  }
};

//Get Discounted Products (products with regularPrice > price)
const getDiscountedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 4; // Default to 4 products

    // Get products where regularPrice > price (indicating a discount) - ONLY APPROVED PRODUCTS
    const products = await productsCollection
      .find({
        status: "approved",
        $expr: { $gt: ["$regularPrice", "$price"] }
      })
      .toArray();

    // Add dynamic ratings to all products
    if (products.length > 0) {
      // Get all product IDs
      const productIds = products.map(item => item._id);

      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: productIds },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      products.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }

        // Calculate discount percentage
        const discountPercentage = Math.round(((item.regularPrice - item.price) / item.regularPrice) * 100);
        item.discountPercentage = discountPercentage;
      });
    }

    // Sort by discount percentage (highest first) and limit
    const discountedProducts = products
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, limit);

    res.status(200).send({ data: discountedProducts, limit });
  } catch (error) {
    next(error);
  }
};

//Get Selected Products (featured/selected products)
const getSelectedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 4; // Default to 4 products

    // Get products marked as featured or selected - ONLY APPROVED PRODUCTS
    const products = await productsCollection
      .find({
        status: "approved",
        $or: [
          { isFeatured: true },
          { isSelected: true },
          { featured: true },
          { selected: true }
        ]
      })
      .toArray();

    // If no featured products found, get some random products - ONLY APPROVED PRODUCTS
    let selectedProducts = products;
    if (selectedProducts.length === 0) {
      selectedProducts = await productsCollection
        .aggregate([
          { $match: { status: "approved" } },
          { $sample: { size: limit } }
        ])
        .toArray();
    }

    // Add dynamic ratings to all products
    if (selectedProducts.length > 0) {
      // Get all product IDs
      const productIds = selectedProducts.map(item => item._id);

      // Get reviews for all these products
      const reviews = await productReviewsCollection
        .find({
          productId: { $in: productIds },
          status: "approved"
        })
        .toArray();

      // Group reviews by product ID
      const reviewsByProduct = {};
      reviews.forEach(review => {
        const productId = review.productId.toString();
        if (!reviewsByProduct[productId]) {
          reviewsByProduct[productId] = [];
        }
        reviewsByProduct[productId].push(review);
      });

      // Calculate dynamic ratings for each product
      selectedProducts.forEach(item => {
        const productId = item._id.toString();
        const productReviews = reviewsByProduct[productId] || [];

        if (productReviews.length > 0) {
          // Calculate average rating
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviews.length;

          // Add dynamic rating and total reviews to product data
          item.rating = parseFloat(averageRating.toFixed(1));
          item.totalReviews = productReviews.length;
        }
      });
    }

    // Limit the results
    const limitedProducts = selectedProducts.slice(0, limit);

    res.status(200).send({ data: limitedProducts, limit });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProductsByCategory,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  updateProduct,
  productsCollection,
  getProductsByOnlyCategory,
  getTopSellingProducts,
  getHighRatedProducts,
  getDiscountedProducts,
  getSelectedProducts
};
