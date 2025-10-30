const { ObjectId } = require("mongodb");
const createError = require("http-errors");

const { client } = require("../../config/mongoDB");
const db = client.db("techLight");
const offersCollections = db.collection("offers");

// GET all offers
const getOffers = async (req, res, next) => {
  try {
    const result = await offersCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /offers
const postOffers = async (req, res) => {
  try {
    const offer = req.body;

    if (!offer.title || !offer.discount) {
      return res.status(400).json({ message: "Title and discount required" });
    }

    const result = await offersCollections.insertOne(offer);
    res
      .status(201)
      .json({ message: "Offer added successfully", id: result.insertedId });
  } catch (error) {
    next(error);
  }
};


// DELETE /offers/:id
// DELETE /offers/:id
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const result = await offersCollections.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// PUT /offers/:id
const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = req.body;

    console.log("Update request received", { id, offer });

    // Ensure discount ends with %
    if (offer.discount && !offer.discount.endsWith("%")) {
      offer.discount += "%";
    }

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ID provided:", id);
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // First, check if the offer exists
    const existingOffer = await offersCollections.findOne({ _id: new ObjectId(id) });
    if (!existingOffer) {
      console.log("Offer not found with ID:", id);
      return res.status(404).json({ message: "Offer not found" });
    }

    // Update the offer
    const updateResult = await offersCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: offer }
    );

    console.log("Update result:", updateResult);

    // Check if the operation was acknowledged and if a document was matched
    if (!updateResult || updateResult.matchedCount === 0) {
      console.log("Failed to update offer with ID:", id);
      return res.status(500).json({ message: "Failed to update offer" });
    }

    // Fetch the updated offer
    const updatedOffer = await offersCollections.findOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Offer updated successfully", offer: updatedOffer });
  } catch (error) {
    console.error("Update error:", error);
    next(error);
  }
};

module.exports = {
  getOffers,
  postOffers,
  deleteOffer,
  updateOffer,
};
