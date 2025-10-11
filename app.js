const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/userRoutes/userRoutes");
const productRouter = require('./routes/productRoutes/productRoutes')
const createError = require('http-errors');
const categoryRouter = require("./routes/productRoutes/categoryRoutes");
const orderRouter = require("./routes/orderRoutes/orderRouters");
const announcementRouter = require("./routes/announcementRoutes/announcementRoutes");

const couponRouter = require("./routes/couponRoutes/couponRoutes");
const notificationsRouter = require("./routes/notificationsRoutes/notificationsRoutes");

const announcementRoutes = require("./routes/announcementRoutes/announcementRoutes");
const supportRoute = require("./routes/supportRoutes/supportRoutes");
const bannerRoute = require("./routes/bannerRoute/bannerRoute");
const wishlistRouter = require("./routes/wishlistRoutes/wishlistRoutes");
const userSupportRouter = require("./routes/userSupportRoutes/userSupportRoutes");


const cartRouter = require("./routes/AddToCartRoutes/AddToCartRoutes");

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
app.use('/api/orders', orderRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/wishlist', wishlistRouter)
app.use('/api/cart', cartRouter)

//Admin routes
app.use("/api/coupons", couponRouter);

//  notifications routes
app.use("/api/notifications", notificationsRouter);



// Routes announcements
app.use("/api/announcements", announcementRoutes);

// Support admin Tickets 
app.use("/api/support", supportRoute);
// banners routes 
app.use("/api/banners", bannerRoute);

// user     support routes
app.use("/api/support/user", userSupportRouter );


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
