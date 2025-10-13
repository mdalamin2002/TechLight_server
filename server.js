const { connectDB } = require("./config/mongoDB");
const app = require("./app");
const { server_port } = require("./secret");
const { createServer } = require("http");
const { initSocket } = require("./config/socketIo");

async function startServer() {
  const server = createServer(app);
  const io = initSocket(server);
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected");
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
