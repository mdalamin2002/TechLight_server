const admin = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Unauthorized Access" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded?.email;
    req.user = { email: decoded?.email, uid: decoded?.uid };
    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
};

module.exports = verifyToken;
