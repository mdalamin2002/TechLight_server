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
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
