const express = require('express');
const { registerUser, loginUser } = require('../../controllers/userControllers/userControllers');
const verifyToken = require('../../middlewares/Auth');
const router = express.Router();

//Register User
router.post("/auth/register", registerUser);

//Login User
router.get("/auth/:email",verifyToken, loginUser);

module.exports = router;
