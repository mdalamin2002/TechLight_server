const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");
const { getIo } = require("../../config/socketIo");

const db = client.db("techLight");
const notificationsCollections = db.collection("notifications");
const usersCollections = db.collection("users");

//  Send Notification
const sendNotification = async (req, res, next) => {
  try {
    const { recipientType, specificUsers, subject, message } = req.body;

    if (!recipientType || !subject || !message) {
      return res.status(400).json({ success: false, error: "Recipient type, subject and message are required" });
    }

    // Determine target users based on recipient type
    let targetUsers = [];
    
    if (recipientType === "specific" && specificUsers && specificUsers.length > 0) {
      // Specific users selected
      targetUsers = specificUsers;
    } else if (recipientType === "role") {
      // Get users by role (user, moderator, admin)
      const roleFilter = req.body.role || "user";
      const users = await usersCollections.find({ role: roleFilter }).toArray();
      targetUsers = users.map(u => ({ userId: u._id.toString(), email: u.email, role: u.role }));
    } else if (recipientType === "all") {
      // All users
      const users = await usersCollections.find({}).toArray();
      targetUsers = users.map(u => ({ userId: u._id.toString(), email: u.email, role: u.role }));
    }

    const notificationData = {
      recipientType,
      role: req.body.role || null,
      specificUsers: recipientType === "specific" ? specificUsers : null,
      targetUserIds: targetUsers.map(u => u.userId),
      subject,
      message,
      readBy: [], // Track which users have read this notification
      createdAt: new Date(),
      sentBy: req.body.adminEmail || "admin"
    };

    const result = await notificationsCollections.insertOne(notificationData);
    const savedNotification = { ...notificationData, _id: result.insertedId };

    // Emit real-time notification via Socket.IO
    try {
      const io = getIo();
      
      // Emit to specific users or roles
      if (recipientType === "specific") {
        targetUsers.forEach(user => {
          io.to(`user_${user.userId}`).emit("new_notification", savedNotification);
        });
      } else if (recipientType === "role") {
        io.to(`role_${req.body.role}`).emit("new_notification", savedNotification);
      } else if (recipientType === "all") {
        io.emit("new_notification", savedNotification);
      }
    } catch (socketError) {
      console.error("Socket emission error:", socketError);
    }

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: savedNotification,
      recipientCount: targetUsers.length
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

//  Get User Notifications (filtered by user ID or role)
const getUserNotifications = async (req, res, next) => {
  try {
    const { userId, role } = req.query;

    let filter = {};
    
    if (userId) {
      filter = {
        $or: [
          { targetUserIds: userId },
          { recipientType: "all" },
          { recipientType: "role", role: role }
        ]
      };
    } else if (role) {
      filter = {
        $or: [
          { recipientType: "all" },
          { recipientType: "role", role: role }
        ]
      };
    }

    const notifications = await notificationsCollections
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Add isRead status for this specific user
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification,
      isRead: notification.readBy?.includes(userId) || false
    }));

    res.status(200).json(notificationsWithReadStatus);
  } catch (error) {
    next(error);
  }
};

// ✅ Mark notification as read (per user)
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // User ID from request body
    
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    // Add user to readBy array if not already present
    const result = await notificationsCollections.updateOne(
      { _id: new ObjectId(id) },
      { 
        $addToSet: { readBy: userId }, // Only adds if not already in array
        $set: { [`readAt.${userId}`]: new Date() } // Store when each user read it
      }
    );

    res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await notificationsCollections.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  sendNotification, 
  getAllNotifications, 
  getUserNotifications,
  markAsRead,
  deleteNotification 
};
