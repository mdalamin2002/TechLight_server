const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const addressCollection = db.collection("addresses");

// Create address
const addAddress = async (req, res) => {
  try {
    const address = req.body;

    // If user sets this as default, reset others
    if (address.default) {
      await addressCollection.updateMany(
        { userEmail: address.userEmail },
        { $set: { default: false } }
      );
    }

    const result = await addressCollection.insertOne(address);
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      id: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports = {
  addAddress,

};
