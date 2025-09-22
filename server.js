const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { run } = require('./config/mongoDB');

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running good");
});

app.listen(port, () => {
  console.log(`Server running good at port : ${port}`);
});
