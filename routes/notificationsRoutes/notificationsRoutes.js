const express = require("express");
const router = express.Router();
const { 
  sendNotification, 
  getAllNotifications, 
  getUserNotifications,
  markAsRead,
  deleteNotification 
} = require("../../controllers/notificationsController/notificationsController");

// POST /api/admin/notifications/send - Send notification
router.post("/send", sendNotification);

// GET /api/admin/notifications - Get all notifications (admin view)
router.get("/", getAllNotifications);

// GET /api/admin/notifications/user - Get user-specific notifications
router.get("/user", getUserNotifications);

// PATCH /api/admin/notifications/:id/read - Mark as read
router.patch("/:id/read", markAsRead);

// DELETE /api/admin/notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
