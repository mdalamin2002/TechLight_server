const express = require('express');
const { getAllCart, createCart, updateCartQuantity, deleteCart } = require('../../controllers/addToCartController/addToCartController');
const cartRouter = express.Router();


// Get all cart items
cartRouter.get("/", getAllCart);

// create Add to cart
cartRouter.post("/", createCart);

// Update quantity
cartRouter.patch("/:id", updateCartQuantity);

// Delete item from cart
cartRouter.delete("/:id", deleteCart);



module.exports = cartRouter;
