const express = require('express');
const { registerUser, loginUser, getAllUsers, updateUserRole, trackLogin, checkLock, userRole } = require('../../controllers/userControllers/userControllers');
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
userRouter.get("/:email", verifyToken, loginUser);

//Getting  User role 
userRouter.get("/role/:email", userRole);

//Update user role
userRouter.patch("/role/:id",verifyToken,verifyAdmin,updateUserRole)



module.exports = userRouter ;
