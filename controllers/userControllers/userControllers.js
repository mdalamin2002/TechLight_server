const { ObjectId } = require("mongodb");
const createError = require("http-errors");
const checkUserStatus = require("../../utils/check_user_status");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const usersCollections = db.collection("users");

//Register User
const registerUser = async (req, res, next) => {
  try {
    const userData = req.body;
    userData.role = "user";
    userData.created_at = new Date();
    userData.last_loggedIn = new Date();
    userData.failedAttempts = 0;
    userData.lockUntil = null;

    const query = { email: userData?.email };
    const alreadyExist = await usersCollections.findOne(query);

    if (!!alreadyExist) {
      const result = await usersCollections.updateOne(query, { $set: { last_loggedIn: new Date() } });
      return res.send(result);
    }
    const result = await usersCollections.insertOne(userData);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

//Track Login
const trackLogin = async (req, res) => {
  const { email, success } = req.body;
  const user = await usersCollections.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (success) {
    await usersCollections.updateOne({ email }, { $set: { failedAttempts: 0, lockUntil: null } });
    return res.json({ message: "Attempts reset" });
  } else {
    let failedAttempts = (user.failedAttempts || 0) + 1;
    const updateData = { failedAttempts };

    if (failedAttempts >= 5) {
      updateData.failedAttempts = 0;
      updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString();
    }

    await usersCollections.updateOne({ email }, { $set: updateData });
    return res.json({ message: "Failed attempt updated", lockUntil: updateData.lockUntil });
  }
};

//check lock route
const checkLock = async (req, res) => {
  const { email } = req.body;
  const user = await usersCollections.findOne({ email });
  if (!user) return res.status(404).send({ allowed: false, message: "User not found" });

  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    return res.send({ 
      allowed: false, 
      message: `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${user.lockUntil}.` 
    });

  }
  return res.send({ allowed: true });
};

//Login User
const loginUser = async (req, res, next) => {
  try {
    const email = req.params.email;
    const decodedEmail = req.decoded;
    if (email !== decodedEmail) {
      return res.status(401).send({ message: "Unauthorize access" });
    }
    const user = await usersCollections.findOne({ email });

    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).send({ success: false, message: statusCheck.message });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

//Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const result = await usersCollections.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

//Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { newRole } = req.body;
    //validation
    if (!newRole) return res.status(400).send({ success: false, message: "Role is required" });
    const query = { _id: new ObjectId(userId) };
    const updateRole = {
      $set: { role: newRole },
    };
    const result = await usersCollections.updateOne(query, updateRole);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, usersCollections, getAllUsers, updateUserRole, trackLogin, checkLock };
