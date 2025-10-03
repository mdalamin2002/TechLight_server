const { connectDB } = require("./config/mongoDB");
const app = require("./app");
const { server_port } = require("./secret");


async function startServer() {
  try {
    await connectDB();
    app.listen(server_port, () => {
      console.log(`Server running on port: ${server_port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

startServer()