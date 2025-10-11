const express = require('express');
const { registerUser, loginUser, getAllUsers, updateUserRole, updateUserProfile , trackLogin, checkLock } = require('../../controllers/userControllers/userControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const userRouter = express.Router();

//Register User
userRouter.post("/auth/register", registerUser);

//Get all users 
userRouter.get("/", verifyToken, verifyAdmin, getAllUsers);

//Track Login
userRouter.post("/auth/trackLogin", trackLogin);

//Check lock
userRouter.post("/auth/checkLock", checkLock);

//Login User
userRouter.get("/auth/:email", verifyToken, loginUser);

//Update user role
userRouter.patch("/role/:id",verifyToken,verifyAdmin,updateUserRole)
// Update User Profile
userRouter.put("/auth/:email", verifyToken, updateUserProfile);


module.exports = userRouter ;
