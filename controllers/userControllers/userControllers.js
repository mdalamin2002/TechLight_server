const { ObjectId } = require("mongodb");
const createError = require("http-errors");
const checkUserStatus = require("../../utils/check_user_status");
const { client } = require("./../../config/mongoDB");
const cloudinary = require("../../config/cloudinary");
const db = client.db("techLight");
const usersCollections = db.collection("users");
// Check if any admin user exists
const anyAdminExists = async () => {
  const count = await usersCollections.countDocuments({ role: "admin" });
  return count > 0;
};

//Register User
const registerUser = async (req, res, next) => {
  try {
    const userData = req.body;
    userData.role = "user";
    userData.created_at = new Date();
    userData.last_loggedIn = new Date();
    userData.failedAttempts = 0;
    userData.lockUntil = null;
    if (!userData.photoURL && !userData.avatar) {
      const nameOrEmail = encodeURIComponent(userData?.name || userData?.email || "User");
      userData.photoURL = `https://ui-avatars.com/api/?name=${nameOrEmail}&background=random`;
    }

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

//Login User
const userRole = async (req, res, next) => {
  try {
    const email = req.params.email;
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
    // validation
    const allowedRoles = ["admin", "moderator", "user"];
    if (!newRole || !allowedRoles.includes(String(newRole).toLowerCase())) {
      return res.status(400).send({ success: false, message: "Invalid role" });
    }
    const query = { _id: new ObjectId(userId) };
    const updateRole = {
      $set: { role: String(newRole).toLowerCase(), updated_at: new Date() },
    };
    const result = await usersCollections.updateOne(query, updateRole);
    res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// Update user profile (name, phone, avatar)
const updateUserProfile = async (req, res, next) => {
  try {
    const rawEmail = req.params.email;
    const email = decodeURIComponent(rawEmail);
    const decodedEmail = req.decoded;
    if (email !== decodedEmail) {
      return res.status(401).send({ message: "Unauthorize access" });
    }

    const user = await usersCollections.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });

    const toSet = {};
    if (typeof req.body?.name === "string") toSet.name = req.body.name;
    if (typeof req.body?.phone === "string") toSet.phone = req.body.phone;

    // If avatar file present, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "techlight/avatars", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      toSet.avatar = uploadResult.secure_url;
    }

    if (Object.keys(toSet).length === 0) {
      return res.status(400).send({ message: "No valid fields to update" });
    }

    await usersCollections.updateOne({ email }, { $set: { ...toSet, updated_at: new Date() } });
    const updated = await usersCollections.findOne({ email });
    return res.status(200).send(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  usersCollections, 
  getAllUsers, 
  updateUserRole, 
  trackLogin, 
  checkLock,
  userRole,
  updateUserProfile
};
