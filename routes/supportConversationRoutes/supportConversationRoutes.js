const express = require("express");
const router = express.Router();
const {
  createConversation,
  getAllConversations,
  getConversationById,
  getUserConversations,
  updateConversationStatus,
  deleteConversation,
  getOrCreateActiveConversation,
} = require("../../controllers/supportConversationController/supportConversationController");

// Create a new conversation
router.post("/conversations", createConversation);

// Get all conversations (for admin/moderator)
router.get("/conversations/allConversations", getAllConversations);

// Get conversation by ID
router.get("/conversations/:id", getConversationById);

// Get or create active conversation for user
router.post("/conversations/active/:userId", getOrCreateActiveConversation);

// Get conversations by user ID
router.get("/conversations/user/:userId", getUserConversations);

// Update conversation status
router.patch("/conversations/:id", updateConversationStatus);

// Delete conversation (soft delete)
router.delete("/conversations/:id", deleteConversation);

module.exports = router;
