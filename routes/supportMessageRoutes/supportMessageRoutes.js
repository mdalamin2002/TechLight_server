const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessagesByConversation,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
} = require("../../controllers/supportMessageController/supportMessageController");

// Send a new message
router.post("/messages", sendMessage);

// Get messages by conversation ID
router.get("/messages/:conversationId", getMessagesByConversation);

// Mark messages as read
router.patch("/messages/read", markMessagesAsRead);

// Get unread message count
router.get("/messages/unread/count", getUnreadCount);

// Delete a message
router.delete("/messages/:id", deleteMessage);

module.exports = router;
