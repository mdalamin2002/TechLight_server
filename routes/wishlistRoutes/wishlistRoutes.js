const express = require('express');
const { getAllWishlists, createWishlists, deleteWishlist } = require('../../controllers/wishlistContrikker/wishlistController');
const wishlistRouter = express.Router();

// get all wishlist
wishlistRouter.get('/', getAllWishlists)

// create a new wishlist
wishlistRouter.post('/', createWishlists)

// delete wishlist
wishlistRouter.delete('/:id', deleteWishlist);

module.exports = wishlistRouter;
