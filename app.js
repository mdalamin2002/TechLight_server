const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/userRoutes/userRoutes");
const productRouter = require('./routes/productRoutes/productRoutes')
const createError = require('http-errors');
const categoryRouter = require("./routes/productRoutes/categoryRoutes");
const orderRouter = require("./routes/orderRoutes/orderRouters");
const announcementsRouter = require("./routes/announcementRoutes/announcementRoutes");
const couponRouter = require("./routes/couponRoutes/couponRoutes");
const notificationsRouter = require("./routes/notificationsRoutes/notificationsRoutes");
const paymentRouter = require("./routes/paymentRoutes/paymentRoutes");
const supportRoute = require("./routes/supportRoutes/supportRoutes");
const supportConversationRoute = require("./routes/supportConversationRoutes/supportConversationRoutes");
const supportMessageRoute = require("./routes/supportMessageRoutes/supportMessageRoutes");
const bannerRoute = require("./routes/bannerRoute/bannerRoute");
const wishlistRouter = require("./routes/wishlistRoutes/wishlistRoutes");
const userSupportRouter = require("./routes/userSupportRoutes/userSupportRoutes");
const userOrderRouter = require("./routes/userOrderRoutes/userOrderRoutes");
const ordersProductRouter = require("./routes/ordersProductRoutes/ordersProductRoutes");
const usersReviewsRouter = require("./routes/usersReviewsRouter/usersReviewsRouter");
const cartRouter = require("./routes/addToCartRoutes/addToCartRoutes");
const returnRouter = require("./routes/returnRoutes/returnRoutes");
const addressRoutes = require("./routes/addressRoutes/addressRoutes");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const aiRouter = require("./routes/aiRoutes/aiRoutes");
const offersRouter = require("./routes/offersRoutes/offersRoutes");

//middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

//test route
app.get("/", (req, res) => {
  res.send("API is running");
});


//Main routes
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
// Announcements
app.use('/api/announcements', announcementsRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/wishlist', wishlistRouter)
app.use('/api/cart', cartRouter)
app.use("/api/addresses", addressRoutes);

//Moderatr routes
app.use('/api/moderator/orders-products', ordersProductRouter);
app.use('/api/moderator/users-reviews', usersReviewsRouter);

//Admin routes
app.use("/api/coupons", couponRouter);
app.use("/api/offers", offersRouter);

//  notifications routes
app.use("/api/notifications", notificationsRouter);
// return routes
app.use("/api/returns", returnRouter);



//payment routes
app.use('/api/payments', paymentRouter)

// Support admin Tickets
app.use("/api/support", supportRoute);
// banners routes
// Support Conversations (Chat System)
app.use("/api/support", supportConversationRoute);
// Support Messages (Chat System)
app.use("/api/support", supportMessageRoute);
// banners routes
app.use("/api/banners", bannerRoute);

// user support routes
app.use("/api/support/user", userSupportRouter);
app.use("/api/support/user/all", userSupportRouter);

// user order routes
app.use("/api/user/orders", userOrderRouter);
app.use("/api/ai", aiRouter);


// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);


module.exports = app;
