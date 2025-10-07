// routes/admin/notificationsRoutes.js
const express = require("express");
const router = express.Router();
const { sendNotification, getAllNotifications } = require("../../controllers/notificationsController/notificationsController");

// POST /api/admin/notifications
router.post("/send", sendNotification);

// GET /api/admin/notifications
router.get("/", getAllNotifications);

module.exports = router;
