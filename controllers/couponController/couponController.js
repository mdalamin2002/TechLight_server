const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const couponsCollections = db.collection("coupons");


// Add new coupon
 const createCoupon = async (req, res, next) => {
  try {
    const couponData =  req.body
    console.log(couponData)
    const result = await couponsCollections.insertOne(couponData);
     res.status(201).send(result);
  } catch (error) {
    next(error)
  }
};

// Get all coupons
const   getAllCoupons = async (req, res, next) => {
  try {
    const result = await couponsCollections.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error)
  }
};





module.exports = {
  getAllCoupons,
  createCoupon,
  
};