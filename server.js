const { connectDB } = require("./config/mongoDB");
const app = require("./app");
const { server_port } = require("./secret");
const { createServer } = require("http");
const { initSocket } = require("./config/socketIo");

async function startServer() {
  const server = createServer(app);
  const io = initSocket(server);
  
  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);

    // Join user-specific room for targeted notifications
    socket.on("join_user_room", ({ userId, role }) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(` User ${userId} joined personal room`);
      }
      if (role) {
        socket.join(`role_${role}`);
        console.log(` User ${userId} joined ${role} room`);
      }
    });

    // Join support team room (for admins/moderators)
    socket.on("join_support_team", ({ userId, role }) => {
      if (role === "admin" || role === "moderator") {
        socket.join("support_team");
        console.log(` ${role} ${userId} joined support team`);
      }
    });

    // Join a specific support conversation
    socket.on("join_support_conversation", ({ conversationId }) => {
      socket.join(conversationId);
      console.log(` User joined conversation: ${conversationId}`);
    });

    // Leave a support conversation
    socket.on("leave_support_conversation", ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    // User typing indicator
    socket.on("support_user_typing", ({ conversationId, isTyping, userName }) => {
      socket.to(conversationId).emit("support_typing", {
        conversationId,
        isTyping,
        userName,
      });
    });

    // Support agent typing indicator
    socket.on("support_agent_typing", ({ conversationId, isTyping, agentName }) => {
      socket.to(conversationId).emit("support_typing", {
        conversationId,
        isTyping,
        agentName,
      });
    });

    // Conversation status update from moderator/admin
    socket.on("update_conversation_status", ({ conversationId, status, updatedBy }) => {
      socket.to(conversationId).emit("conversation_status_updated", {
        conversationId,
        status,
        updatedBy,
      });
      socket.to("support_team").emit("conversation_status_updated", {
        conversationId,
        status,
        updatedBy,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(" User disconnected:", socket.id);
    });
  });

  try {
    await connectDB();
    server.listen(server_port, () => {
      console.log(`Server running on port: ${server_port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

startServer();
