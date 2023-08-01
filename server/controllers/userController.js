const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");

const validateEmail = body("email")
  .trim()
  .isEmail()
  .withMessage("Invalid email format");
const validatePassword = body("password")
  .trim()
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/(?=.*[A-Z])/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/(?=.*[a-z])/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/(?=.*\d)/)
  .withMessage("Password must contain at least one number")
  .matches(/(?=.*[!@#$%^&*])/)
  .withMessage(
    "Password must contain at least one special character (!, @, #, $, etc.)"
  );

exports.login = [
  validateEmail,
  validatePassword,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email: email })
      .populate("friends")
      .populate("friendRequests");

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
      { _id: user._id, email: user.email },
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
  }),
];

exports.signup = [
  validateEmail,
  validatePassword,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: email,
      password: hashedPassword,
    });

    jwt.sign(
      { _id: newUser._id, email: newUser.email },
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
  }),
];
exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find()
    .sort({ username: 1 })
    .populate("friends")
    .populate("friendRequests")
    .exec();

  res.json(allUsers);
});
exports.get_user = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.user_id)
    .populate("friends")
    .exec();

  res.json(user);
});
exports.update_username = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("This field is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const usernameExists = await User.findOne({ username: req.body.username });

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    }

    const user = await User.findById(req.params.user_id).exec();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.username = req.body.username;

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
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

exports.add_photo = asyncHandler(async (req, res, next) => {
  return res.json({ message: "add_photo" });
});
exports.update_photo = asyncHandler(async (req, res, next) => {
  return res.json({ message: "update_photo" });
});
exports.delete_photo = asyncHandler(async (req, res, next) => {
  return res.json({ message: "delete_photo" });
});

exports.add_friend = [
  body("friendId", "Friend ID is required").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    } else {
      const user = await User.findById(req.params.user_id).exec();

      if (user.friends.includes(req.body.friendId)) {
        return res.status(400).json({
          message: "Already friend",
        });
      }
      user.friends.push(req.body.friendId);
      user.friendRequests = user.friendRequests.filter(
        (friendId) => friendId !== req.body.friendId
      );
      const opponentUser = await User.findById(req.body.friendId).exec();
      opponentUser.friends.push(req.params.user_id);

      await user.save();
      await opponentUser.save();
      return res.json({
        message: "Friend added on both sides",
      });
    }
  }),
];
exports.delete_friend = [
  body("friendId", "Friend ID is required").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    } else {
      const user = await User.findById(req.params.user_id).exec();
      user.friends = user.friends.filter(
        (friendId) => friendId !== req.body.friendId
      );
      await user.save();

      const opponentUser = await User.findById(req.body.friendId).exec();
      opponentUser.friends = opponentUser.friends.filter(
        (friendId) => friendId !== req.params.user_id
      );
      await opponentUser.save();
      return res.json({
        message: "Friend deleted",
      });
    }
  }),
];
exports.add_friend_request = [
  body("friendId", "Friend ID is required").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    } else {
      const user = await User.findById(req.body.friendId).exec();
      if (user.friendRequests.includes(req.params.user_id)) {
        return res.status(400).json({
          message: "Friend request already sent",
        });
      }
      user.friendRequests.push(req.params.user_id);
      await user.save();
      return res.json({
        message: "Sent friend request",
      });
    }
  }),
];
exports.delete_friend_request = [
  body("friendId", "Friend ID is required").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" ");
      return res.status(400).json({
        message: errorMessages,
      });
    } else {
      const user = await User.findById(req.params.user_id).exec();
      user.friendRequests = user.friendRequests.filter(
        (friendId) => friendId !== req.body.friendId
      );
      await user.save();
      return res.json({
        message: "Friend request cancelled / denied",
      });
    }
  }),
];
