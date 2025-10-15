const express = require('express');
const { registerUser, loginUser, getAllUsers, updateUserRole, trackLogin, checkLock } = require('../../controllers/userControllers/userControllers');
const { client } = require('../../config/mongoDB');
const db = client.db('techLight');
const usersCollections = db.collection('users');
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

//Update user role
userRouter.patch("/role/:id",verifyToken,verifyAdmin,updateUserRole)

// Bootstrap: if no admin exists, allow the first authenticated user to become admin
userRouter.post('/bootstrap/admin', verifyToken, async (req, res) => {
  try {
    const hasAdmin = await usersCollections.countDocuments({ role: 'admin' });
    if (hasAdmin > 0) return res.status(403).send({ success: false, message: 'Admin already exists' });
    const email = req.decoded;
    if (!email) return res.status(401).send({ success: false, message: 'Unauthorized' });
    const user = await usersCollections.findOne({ email });
    if (!user) return res.status(404).send({ success: false, message: 'User not found' });
    const result = await usersCollections.updateOne({ _id: user._id }, { $set: { role: 'admin', updated_at: new Date() } });
    return res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (e) {
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
});



module.exports = userRouter ;
