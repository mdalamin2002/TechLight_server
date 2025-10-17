const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");
const { getIo } = require("../../config/socketIo");

const db = client.db("techLight");
const messagesCollection = db.collection("supportMessages");
const conversationsCollection = db.collection("supportConversations");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, senderName, senderRole, message, attachments } = req.body;

    // Validate required fields
    if (!conversationId || !senderId || !senderName || !senderRole || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if conversation exists
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if conversation is closed
    if (conversation.status === "closed" || conversation.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to a closed or deleted conversation",
      });
    }

    // Create message document
    const newMessage = {
      conversationId,
      senderId,
      senderName,
      senderRole, // "user", "moderator", "admin"
      message: message.trim(),
      attachments: attachments || [],
      timestamp: new Date(),
      status: "sent", // sent, delivered, read
    };

    const result = await messagesCollection.insertOne(newMessage);
    const messageId = result.insertedId;

    // Auto-assign moderator and change status to 'in-progress' when moderator sends first message
    let updateData = {
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    };

    if ((senderRole === "moderator" || senderRole === "admin") && conversation.status === "open") {
      updateData.status = "in-progress";
      updateData.assignedTo = senderId;
      updateData.assignedToName = senderName;
      updateData.assignedToRole = senderRole;
    }

    // Update conversation's lastMessageAt and potentially status/assignment
    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: updateData }
    );

    // Emit socket event for real-time messaging
    try {
      const io = getIo();
      const messageWithId = { ...newMessage, _id: messageId };
      
      // Emit to conversation room
      io.to(conversationId).emit("new_support_message", messageWithId);
      
      // If status changed to in-progress, emit status update
      if (updateData.status === "in-progress") {
        io.to(conversationId).emit("conversation_status_updated", {
          conversationId,
          status: "in-progress",
          assignedTo: senderId,
          assignedToName: senderName,
          assignedToRole: senderRole,
        });
        io.to("support_team").emit("conversation_status_updated", {
          conversationId,
          status: "in-progress",
          assignedTo: senderId,
          assignedToName: senderName,
          assignedToRole: senderRole,
        });
      }
      
      // If user sent message, notify support team
      if (senderRole === "user") {
        io.to("support_team").emit("new_user_message", {
          conversationId,
          message: messageWithId,
          conversation,
        });
      }
    } catch (socketError) {
      console.log("Socket error:", socketError.message);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        ...newMessage,
        _id: messageId,
      },
    });
  } catch (error) {
    console.error(" Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Get all messages for a conversation
const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if conversation exists
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Note: Access control should be handled by frontend filtering
    // Backend will return messages for any valid conversation
    // Frontend ensures moderators only request their assigned conversations

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await messagesCollection
      .find({ conversationId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    console.log(messages);

    const total = await messagesCollection.countDocuments({ conversationId });

    console.log(total);

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId, role } = req.body;

    if (!conversationId || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide conversationId and role",
      });
    }

    // Mark all messages from the opposite role as read
    const senderRole = role === "user" ? { $ne: "user" } : "user";

    const result = await messagesCollection.updateMany(
      {
        conversationId,
        senderRole,
        status: { $ne: "read" },
      },
      {
        $set: { status: "read" },
      }
    );

    // Emit socket event
    try {
      const io = getIo();
      io.to(conversationId).emit("messages_read", {
        conversationId,
        role,
      });
    } catch (socketError) {
      console.log("Socket error:", socketError.message);
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { conversationId, role } = req.query;

    if (!conversationId || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide conversationId and role",
      });
    }

    // Count unread messages from the opposite role
    const senderRole = role === "user" ? { $ne: "user" } : "user";

    const count = await messagesCollection.countDocuments({
      conversationId,
      senderRole,
      status: { $ne: "read" },
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const result = await messagesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessagesByConversation,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
};
