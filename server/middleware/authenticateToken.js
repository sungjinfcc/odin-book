const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Verification Error:", err.message);
      return res.status(403).json({ message: `Invalid token: ${token}` });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
