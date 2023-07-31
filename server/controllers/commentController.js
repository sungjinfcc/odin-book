const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

exports.comment_list = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id)
    .populate({
      path: "comments",
      populate: {
        path: "author", // Populate the "author" field inside comments
      },
    })
    .sort({ timestamp: 1 })
    .exec();

  res.json(post.comments);
});

exports.comments_by_user = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ author: req.user._id })
    .populate("author")
    .sort({ timestamp: 1 })
    .exec();

  res.json(comments);
});

exports.create_comment = [
  body("message", "Message field is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
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
      const user = await User.findById(req.user._id).exec();
      const post = await Post.findById(req.params.post_id).exec();
      const newComment = new Comment({
        author: req.user._id,
        message: req.body.message,
      });
      user.comments.push(newComment._id);
      post.comments.push(newComment._id);
      await newComment.save();
      await user.save();
      await post.save();
      return res.json({
        message: "Comment created",
      });
    }
  }),
];

exports.delete_comment = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).exec();
  user.comments = user.comments.filter(
    (comment) => comment !== req.params.comment_id
  );
  const post = await Post.findById(req.params.post_id).exec();
  post.comments = post.comments.filter(
    (comment) => comment !== req.params.comment_id
  );
  await Comment.findByIdAndRemove(req.params.comment_id);
  await user.save();
  await post.save();
  return res.json({ message: "Succesfully deleted" });
});
