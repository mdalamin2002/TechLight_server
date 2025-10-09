const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const bannersCollection = db.collection("banners");

//  Create
const createBanner = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await bannersCollection.insertOne(data);
    res.status(201).send({
      ...data,
      _id: result.insertedId,
      message: "Banner created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get All
const getAllBanners = async (req, res, next) => {
  try {
    const result = await bannersCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//  Update
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await bannersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    res.status(200).send({
      message: "Banner updated successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

//  Delete
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await bannersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.status(200).send({
      message: "Banner deleted successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
};
