const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");
const { getIo } = require("../../config/socketIo");

const db = client.db("techLight");
const conversationsCollection = db.collection("supportConversations");
const messagesCollection = db.collection("supportMessages");

// Create a new support conversation
const createConversation = async (req, res) => {
  try {
    const data = req.body;
    const { userId, userName, userEmail, userPhone, subject, category, initialMessage,senderRole } = req.body;
console.log(data);
    // Create conversation document
    const conversation = {
      userId: userId || "guest",
      userName,
      userEmail,
      userPhone: userPhone || null,
      subject,
      category,
      status: "open", 
      priority: "normal", 
      assignedTo: null, 
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    };

    const result = await conversationsCollection.insertOne(conversation);
    const conversationId = result.insertedId;

    // Create initial message
    const initialMsg = {
      conversationId: conversationId.toString(),
      senderId: userId || "guest",
      senderName: userName,
      senderRole: senderRole,
      message: initialMessage,
      timestamp: new Date(),
      status: "sent",
    };

    await messagesCollection.insertOne(initialMsg);

    // Emit socket event to notify admins/moderators
    try {
      const io = getIo();
      io.to("support_team").emit("new_support_conversation", {
        ...conversation,
        _id: conversationId,
      });
    } catch (socketError) {
      console.log("Socket not initialized or error:", socketError.message);
    }

    res.status(201).json({
      success: true,
      message: "Support conversation created successfully",
      conversation: {
        ...conversation,
        _id: conversationId,
      },
    });
  } catch (error) {
    console.error(" Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

// Get all conversations (for admin/moderator dashboard)
const getAllConversations = async (req, res) => {
  const check = req.params;
  try {
    const { status, assignedTo, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await conversationsCollection
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await conversationsCollection.countDocuments(filter);

    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(" Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// Get conversation by ID
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(" Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

// Get conversations by user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await conversationsCollection
      .find({ userId })
      .sort({ lastMessageAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("= Error fetching user conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user conversations",
      error: error.message,
    });
  }
};

// Update conversation status
const updateConversationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const result = await conversationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Emit socket event
    try {
      const io = getIo();
      io.to(id).emit("conversation_status_updated", {
        conversationId: id,
        status,
      });
    } catch (socketError) {
      console.log("Socket error:", socketError.message);
    }

    res.status(200).json({
      success: true,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error(" Error updating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update conversation",
      error: error.message,
    });
  }
};

// Delete conversation (soft delete - change status to deleted)
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const result = await conversationsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "deleted",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error(" Error deleting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message,
    });
  }
};

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
  getUserConversations,
  updateConversationStatus,
  deleteConversation,
};
