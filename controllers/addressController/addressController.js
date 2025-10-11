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

// Get all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const email = req.query.email;
    const addresses = await addressCollection
      .find({ userEmail: email })
      .sort({ _id: -1 })
      .toArray();
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;

    // Handle new default
    if (updated.default) {
      const existing = await addressCollection.findOne({ _id: new ObjectId(id) });
      if (existing && existing.userEmail) {
        await addressCollection.updateMany(
          { userEmail: existing.userEmail },
          { $set: { default: false } }
        );
      }
    }

    const result = await addressCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports = {
  addAddress,
  getAddresses,
  updateAddress,

};
