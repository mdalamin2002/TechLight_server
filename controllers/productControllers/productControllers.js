const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const createError = require("http-errors");
const productsCollection = db.collection("products");
const productReviewsCollection = db.collection("productReviews"); // Add reviews collection

//Create Product
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    productData.status = "active";
    productData.created_at = new Date();
    productData.updated_at = new Date();
    const result = await productsCollection.insertOne(productData);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

//Get All Product (with pagination)
const getAllProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: "inactive" } };
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
    const result = await productsCollection.find({ category, subCategory, status: { $ne: 'inactive' } }).toArray();

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
    const result = await productsCollection.find({ category:category, status: { $ne: 'inactive' } }).toArray();

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

module.exports = {
  createProduct,
  getProductsByCategory,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
    updateProduct,
  productsCollection,
    getProductsByOnlyCategory
};
