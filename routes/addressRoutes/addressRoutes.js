const express = require('express');
const { addAddress, getAddresses, updateAddress, deleteAddress, getDefaultAddress } = require('../../controllers/addressController/addressController');
const addressRoutes = express.Router();


addressRoutes.post("/", addAddress);
addressRoutes.get("/", getAddresses);
addressRoutes.put("/:id", updateAddress);
addressRoutes.delete("/:id", deleteAddress);
addressRoutes.get('/default', getDefaultAddress);



module.exports = addressRoutes;
