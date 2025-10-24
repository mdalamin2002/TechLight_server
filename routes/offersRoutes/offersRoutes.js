const express = require("express");
const {
  getOffers,
  postOffers,
  deleteOffer,
  updateOffer,
} = require("../../controllers/offersController/offersController");

const offersRouter = express.Router();

//Get all offers
offersRouter.get("/", getOffers);

//post all offers
offersRouter.post("/", postOffers);

// Delete offer by ID
offersRouter.delete("/:id", deleteOffer);

// Update offer by ID
offersRouter.put("/:id", updateOffer);

module.exports = offersRouter;
