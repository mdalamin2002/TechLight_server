const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const notificationsCollections = db.collection("notifications");

// ✅ Send Notification
const sendNotification = async (req, res, next) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    const notificationData = {
      recipient,
      subject,
      message,
      createdAt: new Date(),
    };

    const result = await notificationsCollections.insertOne(notificationData);

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Notifications
const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsCollections
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendNotification, getAllNotifications };
