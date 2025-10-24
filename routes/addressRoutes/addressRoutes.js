const express = require('express');
const { addAddress, getAddresses, updateAddress, deleteAddress, getDefaultAddress, setDefaultAddress } = require('../../controllers/addressController/addressController');
const verifyToken = require('../../middlewares/auth');
const addressRoutes = express.Router();


addressRoutes.post("/", verifyToken, addAddress);
addressRoutes.get("/", verifyToken, getAddresses);
addressRoutes.put("/:id", verifyToken, updateAddress);
addressRoutes.delete("/:id", verifyToken, deleteAddress);
addressRoutes.get('/default', verifyToken, getDefaultAddress);
addressRoutes.patch('/:id/set-default', verifyToken, setDefaultAddress);



module.exports = addressRoutes;
