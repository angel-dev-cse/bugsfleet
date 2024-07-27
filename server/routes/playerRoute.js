const express = require("express");
const router = express.Router();

const { authb, auth } = require("../middlewares/auth");

const {
  createPlayer,
  login,
  logout
} = require("../controllers/playerController");

router.post("/", createPlayer);
router.post("/login", login);
router.post("/logout", auth, logout);

module.exports = router;
