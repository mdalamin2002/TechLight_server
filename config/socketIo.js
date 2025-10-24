
let io;
function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://tech-light-client.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initSocket, getIo };
