const { ObjectId } = require("mongodb");
const checkUserStatus = require("../../utils/check_user_status");
const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const usersCollections = db.collection("users");

//Register User
const registerUser = async (req, res) => {
  try {
    const userData = req.body;

    // Checking user already exist or not
    const isExist = await usersCollections.findOne({ email: userData?.email });
    if (isExist) {
      return res.status(400).send({ message: "User already exists" });
    }

    //Create new User
    userData.role = "user";
    userData.status = "active";
    userData.created_at = new Date();
    const result = await usersCollections.insertOne(userData);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

//Login User
const loginUser = async (req, res) => {
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
    res.status(500).send({ message: "Internal server error" });
  }
};

//Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await usersCollections.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

//Update user role
const updateUserRole = async (req, res) => {
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
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, usersCollections, getAllUsers, updateUserRole };
