require("dotenv").config();
const port = process.env.PORT || 5000;
const { connectDB } = require("./config/mongoDB");
const app = require("./app");


async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

startServer()