const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../../controllers/userControllers/userControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const router = express.Router();

//Register User
router.post("/auth/register", registerUser);

//Get all users 
router.get("/",verifyToken,verifyAdmin,getAllUsers)

//Login User
router.get("/auth/:email", verifyToken, loginUser);

module.exports = router;
