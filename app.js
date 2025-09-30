const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require('./routes/userRoutes/userRoutes')
const productRoutes = require('./routes/productRoutes/productRoutes')
const createError = require('http-errors');

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


//Client side errors
app.use((req, res, next) => {
  next(createError(404,"route not found"))
})

//server side errors -> all the errors come here
app.use((err, req, res, next) => {
  return res.status(err.status || 500).send({
    success: false,
    message: err.message
  })
})


module.exports = app;