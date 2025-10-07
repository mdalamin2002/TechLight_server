const { client } = require("./../../config/mongoDB");
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const announcementsCollection = db.collection("announcements");

// GET all
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await announcementsCollection.find().toArray();
    res.status(200).json(announcements);
  } catch (err) {
    next(err);
  }
};

// CREATE
const createAnnouncement = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await announcementsCollection.insertOne(data);
    res.status(201).json({ ...data, _id: result.insertedId });
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await announcementsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ ...updateData, _id: id });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await announcementsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
