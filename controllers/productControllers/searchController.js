const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");
const createError = require("http-errors");

const db = client.db("techLight");
const productsCollection = db.collection("products");

/**
 * Search products with text search and fuzzy matching
 * Supports: name, description, brand, category, subcategory
 * @route GET /api/products/search
 * @query q - search query string
 * @query category - filter by specific category (optional)
 * @query page - page number (default: 1)
 * @query limit - items per page (default: 20, max: 100)
 */
const searchProducts = async (req, res, next) => {
  try {
    const searchQuery = req.query.q?.trim();
    const categoryFilter = req.query.category?.trim();
    
    if (!searchQuery && !categoryFilter) {
      return res.status(200).send({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        query: "",
        category: "",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    // Build search filter with multiple field matching
    const searchRegex = searchQuery ? new RegExp(searchQuery, "i") : null;
    const categoryRegex = categoryFilter ? new RegExp(categoryFilter, "i") : null;
    
    // Build dynamic search filter
    const searchFilter = {
      status: { $ne: "inactive" },
    };

    // If category filter is specified, prioritize it
    if (categoryRegex) {
      searchFilter.$and = [
        {
          $or: [
            { category: categoryRegex },
            { subCategory: categoryRegex },
          ],
        },
      ];
      
      // If search query also provided, add it to the filter
      if (searchRegex) {
        searchFilter.$and.push({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { brand: searchRegex },
            { tags: searchRegex },
          ],
        });
      }
    } else if (searchRegex) {
      // No category filter, just search
      searchFilter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Execute search with pagination
    const [items, total] = await Promise.all([
      productsCollection
        .find(searchFilter)
        .project({
          _id: 1,
          name: 1,
          image: 1,
          images: 1,
          price: 1,
          originalPrice: 1,
          discount: 1,
          category: 1,
          subCategory: 1,
          brand: 1,
          rating: 1,
          reviewCount: 1,
          stock: 1,
          status: 1,
        })
        .skip(skip)
        .limit(limit)
        .toArray(),
      productsCollection.countDocuments(searchFilter),
    ]);

    // Calculate relevance score and sort by relevance
    const rankedItems = items.map((item) => {
      let relevanceScore = 0;

      // Exact name match gets highest score
      if (item.name?.toLowerCase() === searchQuery.toLowerCase()) {
        relevanceScore += 100;
      }
      // Name starts with query
      else if (item.name?.toLowerCase().startsWith(searchQuery.toLowerCase())) {
        relevanceScore += 50;
      }
      // Name contains query
      else if (item.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        relevanceScore += 25;
      }

      // Brand match
      if (item.brand?.toLowerCase().includes(searchQuery.toLowerCase())) {
        relevanceScore += 15;
      }

      // Category match
      if (item.category?.toLowerCase().includes(searchQuery.toLowerCase())) {
        relevanceScore += 10;
      }

      // SubCategory match
      if (item.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())) {
        relevanceScore += 8;
      }

      return { ...item, relevanceScore };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.status(200).send({
      data: rankedItems,
      page,
      limit,
      total,
      query: searchQuery || "",
      category: categoryFilter || "",
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get search suggestions for autocomplete
 * @route GET /api/products/search/suggestions
 * @query q - search query string
 * @query limit - max suggestions (default: 5, max: 10)
 */
const getSearchSuggestions = async (req, res, next) => {
  try {
    const searchQuery = req.query.q?.trim();
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.status(200).send({ suggestions: [] });
    }

    const limit = Math.min(parseInt(req.query.limit || "5", 10), 10);
    const searchRegex = new RegExp(searchQuery, "i");

    // Get unique suggestions from product names and brands
    const products = await productsCollection
      .find({
        status: { $ne: "inactive" },
        $or: [
          { name: searchRegex },
          { brand: searchRegex },
          { category: searchRegex },
        ],
      })
      .project({ name: 1, brand: 1, category: 1 })
      .limit(limit * 2)
      .toArray();

    // Extract unique suggestions
    const suggestions = new Set();
    products.forEach((product) => {
      if (product.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.add(product.name);
      }
      if (product.brand?.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.add(product.brand);
      }
      if (product.category?.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.add(product.category);
      }
    });

    res.status(200).send({
      suggestions: Array.from(suggestions).slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Setup MongoDB text index for better search performance
 * Call this once during deployment or migration
 */
const createSearchIndex = async () => {
  try {
    await productsCollection.createIndex({
      name: "text",
      description: "text",
      brand: "text",
      category: "text",
      subCategory: "text",
      tags: "text",
    });
    console.log("✅ Search index created successfully");
  } catch (error) {
    console.error("❌ Error creating search index:", error);
  }
};

/**
 * Get all available categories with product counts
 * @route GET /api/products/categories/list
 */
const getCategoriesWithCount = async (req, res, next) => {
  try {
    const categories = await productsCollection.aggregate([
      { $match: { status: { $ne: "inactive" } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          subCategories: { $addToSet: "$subCategory" },
        },
      },
      { $sort: { count: -1 } },
    ]).toArray();

    const formattedCategories = categories.map(cat => ({
      category: cat._id,
      productCount: cat.count,
      subCategories: cat.subCategories.filter(Boolean),
    }));

    res.status(200).send({
      categories: formattedCategories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
  createSearchIndex,
  getCategoriesWithCount,
};
