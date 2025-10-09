const express = require('express');
const { getAllWishlists, createWishlists } = require('../../controllers/wishlistContrikker/wishlistController');
const wishlistRouter = express.Router();

// get all wishlist
wishlistRouter.get('/', getAllWishlists)

// create a new wishlist
wishlistRouter.post('/', createWishlists)

module.exports = wishlistRouter;
