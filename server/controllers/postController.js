const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const Post = require("../models/post");
const User = require("../models/user");

exports.post_list = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find()
    .populate("author")
    .populate("likedUsers")
    .populate("comments")
    .sort({ timestamp: 1 })
    .exec();

  res.json(allPosts);
});

exports.posts_by_user = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ author: req.user._id })
    .populate("author")
    .populate("likedUsers")
    .populate("comments")
    .sort({ timestamp: 1 })
    .exec();

  res.json(posts);
});

exports.create_post = [
  body("title", "Title field is required").trim().isLength({ min: 1 }).escape(),
  body("content", "Content field is required")
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

      const newPost = new Post({
        author: req.user._id,
        title: req.body.title,
        content: req.body.content,
      });
      user.posts.push(newPost._id);
      await newPost.save();
      await user.save();
      return res.json({
        message: "Post created",
      });
    }
  }),
];

exports.update_post = [
  body("title", "Title field is required").trim().isLength({ min: 1 }).escape(),
  body("content", "Content field is required")
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
      const post = await Post.findById(req.params.post_id).exec();
      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }
      post.title = req.body.title;
      post.content = req.body.content;
      await post.save();
      return res.json({
        post: post,
        message: "Post updated",
      });
    }
  }),
];

exports.delete_post = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).exec();
  user.posts = user.posts.filter((post) => post !== req.params.post_id);
  await Post.findByIdAndRemove(req.params.post_id);
  await user.save();
  return res.json({ message: "Succesfully deleted" });
});

exports.like_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.post_id).exec();
  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }
  const user = await User.findById(req.user._id).exec();
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  user.likedPosts.push(post._id);
  post.likedUsers.push(user._id);
  await user.save();
  await post.save();
  return res.json({ message: "Liked post" });
});
