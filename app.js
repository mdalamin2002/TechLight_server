const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require('./routes/userRoutes/userRoutes')
const productRoutes = require('./routes/productRoutes/productRoutes')

//middleware
app.use(cors());
app.use(express.json());

//test route
app.get("/", (req, res) => {
  res.send("API is running");
});


//Main routes 
app.use('/users',userRoutes)
app.use('/products', productRoutes);


module.exports = app;