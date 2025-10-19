const { client } = require("../config/mongoDB");

const db = client.db("techLight");
const usersCollection = db.collection("users");

const verifyModerator = async (req, res, next) => {
  try {
    const email = req.decoded;
    if (!email) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.role !== "moderator" && user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden Access. Moderator or Admin only." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyModerator;
