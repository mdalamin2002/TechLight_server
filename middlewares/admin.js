const { usersCollections } = require("../controllers/userControllers/userControllers");

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded;
    if (!email) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    const user = await usersCollections.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden Access. Admin only." });
    }
    next();
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyAdmin;
