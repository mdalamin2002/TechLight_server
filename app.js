const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/userRoutes/userRoutes");
const productRouter = require('./routes/productRoutes/productRoutes')
const createError = require('http-errors');
const categoryRouter = require("./routes/productRoutes/categoryRoutes");

const couponRouter = require("./routes/couponRoutes/couponRoutes");
const notificationsRouter = require("./routes/notificationsRoutes/notificationsRoutes");

//middleware
app.use(cors());
app.use(express.json());

//test route
app.get("/", (req, res) => {
  res.send("API is running");
});


//Main routes 
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/products/categories', categoryRouter);

//Admin routes
app.use("/api/coupons", couponRouter);

//  notifications routes
app.use("/api/admin/notifications", notificationsRouter);


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