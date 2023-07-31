const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, default: "" },
  photo: { type: String, default: "" },
  friends: { type: Array, default: [], ref: "User" },
  friendRequests: { type: Array, default: [], ref: "User" },
  posts: { type: Array, default: [], ref: "Post" },
  likedPosts: { type: Array, default: [], ref: "Post" },
  comments: { type: Array, default: [], ref: "Comment" },
});

module.exports = mongoose.model("User", UserSchema);
