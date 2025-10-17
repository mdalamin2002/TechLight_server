const { client } = require("./../../config/mongoDB");
const { ObjectId } = require("mongodb");
const db = client.db("techLight");
const couponsCollections = db.collection("coupons");


// Add new coupon
 const createCoupon = async (req, res, next) => {
  try {
    const couponData =  req.body
    const result = await couponsCollections.insertOne(couponData);
     res.status(201).send({
      acknowledged: result.acknowledged,
      insertedId: result.insertedId,
      message: "Coupon created successfully"
     });
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

// Update a coupon

const updateCoupon = async (req, res, next) => {
  try {
    const {id} = req.params
    const updateData = req.body;
    const result = await couponsCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).send(result);
  } catch (error) {
    next(error)
  }

}

// Delete a coupon

const deleteCoupon = async (req, res, next) => {
  try {
    const {id} = req.params
    const result = await couponsCollections.deleteOne({ _id: new ObjectId(id) });
    res.status(200).send(result);
  } catch (error) {
    next(error)
  }
}





module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
  
};