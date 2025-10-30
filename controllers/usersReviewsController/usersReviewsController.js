const { ObjectId } = require("mongodb");
const createError = require("http-errors");

const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const moderatorUsersReportsCollections = db.collection(
  "moderator_users_reports"
);

const moderatorUsersReviewsCollections = db.collection(
  "moderator_users_reviews"
);

// GET all Reports
const getReports = async (req, res, next) => {
  try {
    const result = await moderatorUsersReportsCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PATCH: Warn a user
const warnUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await moderatorUsersReportsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Warned" } }
    );

    if (result.modifiedCount === 0)
      return next(createError(404, "Report not found"));

    res.status(200).json({ message: "User has been warned successfully." });
  } catch (error) {
    next(error);
  }
};

// PATCH: Temporarily ban a user
const tempBanUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await moderatorUsersReportsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Temporarily Banned" } }
    );

    if (result.modifiedCount === 0)
      return next(createError(404, "Report not found"));

    res.status(200).json({ message: "User has been temporarily banned." });
  } catch (error) {
    next(error);
  }
};

//verify Report
const verifyReport = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const result = await moderatorUsersReportsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status || "Verified" } }
    );

    if (result.modifiedCount === 0)
      return next(createError(404, "Report not found"));

    res.status(200).json({ message: "Report verified successfully." });
  } catch (error) {
    next(error);
  }
};

// GET all Reviews
const getReviews = async (req, res, next) => {
  try {
    const result = await moderatorUsersReviewsCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PATCH: Update a review status (approve, pending, reject)
const updateReviewStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Approved", "Pending", "Rejected"];
    if (!validStatuses.includes(status)) {
      return next(createError(400, "Invalid status value"));
    }

    const result = await moderatorUsersReviewsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0)
      return next(createError(404, "Review not found"));

    res.status(200).json({ message: `Review ${status} successfully.` });
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove a review
const deleteReview = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await moderatorUsersReviewsCollections.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return next(createError(404, "Review not found"));

    res.status(200).json({ message: "Review removed successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  warnUser,
  tempBanUser,
  verifyReport,
  getReviews,
  updateReviewStatus, // Updated to use the new function
  deleteReview
};
