const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");

exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find().sort({ username: 1 }).exec();

  res.json(allUsers);
});

exports.get_user = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.user_id).exec();

  res.json(user);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(400).json({
      message: "No user found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: "Wrong password",
    });
  }

  jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
    (err, token) => {
      if (err) return res.status(400).json(err);

      res.json({
        token,
        user: user,
        message: "Login successful!",
      });
    }
  );
});

exports.signup = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username });

  if (user) {
    return res
      .status(400)
      .json({ message: "User with this username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username: username,
    password: hashedPassword,
  });

  jwt.sign(
    { _id: newUser._id, username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
    (err, token) => {
      if (err) console.log(err);

      res.status(200).json({
        token,
        user: newUser,
        message: "Signed in correctly!",
      });
    }
  );
});

exports.update_username = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("This field is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const user = await User.findById(req.params.user_id).exec();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const usernameExists = await User.findOne({ username: req.body.username });

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    }

    user.username = req.body.username;

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0],
      });
    } else {
      await user.save();
      return res.json({
        user: user,
        message: "Username updated",
      });
    }
  }),
];

exports.delete_user = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.user_id);
  return res.json({ message: "Succesfully deleted" });
});
