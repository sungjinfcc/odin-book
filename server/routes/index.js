var express = require("express");
var router = express.Router();

const authenticateToken = require("../middlewares/authenticateToken");
const uploadFile = require("../middlewares/uploadFile");

const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");

// user controller
router.post("/user/login", user_controller.login);
router.post("/user/signup", user_controller.signup);

router.get("/users", authenticateToken, user_controller.user_list);
router.get("/user/:user_id", authenticateToken, user_controller.get_user);
router.put(
  "/user/:user_id/update",
  authenticateToken,
  user_controller.update_username
);
router.delete(
  "/user/:user_id/delete",
  authenticateToken,
  user_controller.delete_user
);

router.post(
  "/user/:user_id/add_photo",
  authenticateToken,
  uploadFile,
  user_controller.add_photo
);

router.post(
  "/user/:user_id/add_friend",
  authenticateToken,
  user_controller.add_friend
);
router.delete(
  "/user/:user_id/delete_friend",
  authenticateToken,
  user_controller.delete_friend
);

router.post(
  "/user/:user_id/add_friend_request",
  authenticateToken,
  user_controller.add_friend_request
);
router.delete(
  "/user/:user_id/delete_friend_request",
  authenticateToken,
  user_controller.delete_friend_request
);

// post controller

router.get("/posts", authenticateToken, post_controller.post_list);
router.get("/post/by_user", authenticateToken, post_controller.posts_by_user);
router.post(
  "/post/create_post",
  authenticateToken,
  post_controller.create_post
);
router.put(
  "/post/:post_id/update",
  authenticateToken,
  post_controller.update_post
);
router.delete(
  "/post/:post_id/delete",
  authenticateToken,
  post_controller.delete_post
);

router.post(
  "/post/:post_id/like_post",
  authenticateToken,
  post_controller.like_post
);

// comment controller

router.get(
  "/:post_id/comments",
  authenticateToken,
  comment_controller.comment_list
);
router.get(
  "/:post_id/comment/by_user",
  authenticateToken,
  comment_controller.comments_by_user
);
router.post(
  "/:post_id/create_comment",
  authenticateToken,
  comment_controller.create_comment
);
router.delete(
  "/:post_id/comment/:comment_id/delete",
  authenticateToken,
  comment_controller.delete_comment
);

module.exports = router;
