const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  likedUsers: { type: Array, default: [], ref: "User" },
  comments: { type: Array, default: [], ref: "Comment" },
});

module.exports = mongoose.model("Post", PostSchema);
