require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

//MongoDB URI
const uri = process.env.mongoDbUri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully");
    return client;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
  }
}
connectDB().catch(console.dir);

module.exports = { connectDB, client };