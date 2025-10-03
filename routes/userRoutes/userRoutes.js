const express = require('express');
const { registerUser, loginUser, getAllUsers, updateUserRole } = require('../../controllers/userControllers/userControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const userRouter = express.Router();

//Register User
userRouter.post("/auth/register", registerUser);

//Get all users 
userRouter.get("/",verifyToken,verifyAdmin,getAllUsers)

//Login User
userRouter.get("/auth/:email", verifyToken, loginUser);

//Update user role
userRouter.patch("/role/:id",verifyToken,verifyAdmin,updateUserRole)



module.exports = userRouter ;
