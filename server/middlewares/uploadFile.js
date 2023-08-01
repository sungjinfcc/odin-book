const multer = require("multer");
const User = require("../models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Add a unique suffix to the filename to avoid overwriting
  },
});

const upload = multer({ storage: storage }).single("photo");

const uploadFile = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to upload file" });
    }
    next();
  });
};

module.exports = uploadFile;
