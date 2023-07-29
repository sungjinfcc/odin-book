var express = require("express");
var router = express.Router();

const authenticateToken = require("../middlewares/authenticateToken");

const user_controller = require("../controllers/userController");

// Auth
router.post("/user/login", user_controller.login);
router.post("/user/signup", user_controller.signup);
router.get("/users", authenticateToken, user_controller.user_list);
router.get("/user/:user_id", authenticateToken, user_controller.get_user);
router.put(
  "/user/:user_id/update",
  authenticateToken,
  user_controller.update_name
);
router.delete(
  "/user/:user_id/delete",
  authenticateToken,
  user_controller.delete_user
);

module.exports = router;
