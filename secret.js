require("dotenv").config();

//All server secret here
const mongoDB_uri = process.env.MONGO_DB_URI || "mongodb://localhost:27017/techLight";
const server_port = process.env.SERVER_PORT || 5001;

module.exports = { mongoDB_uri, server_port };