const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const announcementsCollection = db.collection("announcements");

// ✅ Create
const createAnnouncement = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await announcementsCollection.insertOne(data);
    res.status(201).send({
      ...data,
      _id: result.insertedId,
      message: "Announcement created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All
const getAllAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementsCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

// ✅ Update
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await announcementsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

// ✅ Delete
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await announcementsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
