const express = require("express");
const {
  getAllCoupons,
  createCoupon,

} = require("../../controllers/couponController/couponController");
const verifyToken = require("../../middlewares/auth");
const verifyAdmin = require("../../middlewares/admin");

const couponRouter = express.Router();

couponRouter.post("/", createCoupon);
couponRouter.get("/",  getAllCoupons);
// couponRouter.put("/:id", verifyToken, verifyAdmin, updateCoupon);
// couponRouter.delete("/:id", verifyToken, verifyAdmin, deleteCoupon);

module.exports = couponRouter;