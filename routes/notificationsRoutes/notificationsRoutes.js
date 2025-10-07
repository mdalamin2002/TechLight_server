const express = require("express");
const router = express.Router();
const { sendNotification, getAllNotifications } = require("../../controllers/notificationsController/notificationsController");

// POST /api/admin/notifications/send
router.post("/send", sendNotification);

// GET /api/admin/notifications
router.get("/", getAllNotifications);

module.exports = router;
