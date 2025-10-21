const { ObjectId } = require("mongodb");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const addressCollection = db.collection("addresses");

// Create address
const addAddress = async (req, res) => {
  try {
    const address = req.body;
    const userEmail = req.user.email;

    // Add userEmail and timestamps
    const newAddress = {
      ...address,
      userEmail,
      default: address.default || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If user sets this as default, reset others
    if (newAddress.default) {
      await addressCollection.updateMany(
        { userEmail },
        { $set: { default: false } }
      );
    }

    const result = await addressCollection.insertOne(newAddress);
    const createdAddress = await addressCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: createdAddress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const addresses = await addressCollection
      .find({ userEmail })
      .sort({ default: -1, _id: -1 })
      .toArray();
    res.status(200).json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;
    const userEmail = req.user.email;

    // Verify ownership
    const existing = await addressCollection.findOne({
      _id: new ObjectId(id),
      userEmail
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized"
      });
    }

    // Handle new default
    if (updated.default) {
      await addressCollection.updateMany(
        { userEmail },
        { $set: { default: false } }
      );
    }

    const updateData = {
      ...updated,
      updatedAt: new Date(),
    };
    delete updateData._id; // Remove _id if present

    const result = await addressCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedAddress = await addressCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    // Verify ownership
    const existing = await addressCollection.findOne({
      _id: new ObjectId(id),
      userEmail
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized"
      });
    }

    const result = await addressCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get default address (for checkout)
const getDefaultAddress = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const address = await addressCollection.findOne({
      userEmail,
      default: true,
    });
    res.status(200).json({ success: true, data: address || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    // Verify ownership
    const existing = await addressCollection.findOne({
      _id: new ObjectId(id),
      userEmail
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized"
      });
    }

    // Reset all defaults for this user
    await addressCollection.updateMany(
      { userEmail },
      { $set: { default: false } }
    );

    // Set new default
    await addressCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { default: true, updatedAt: new Date() } }
    );

    const updatedAddress = await addressCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: updatedAddress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
  setDefaultAddress,
};
