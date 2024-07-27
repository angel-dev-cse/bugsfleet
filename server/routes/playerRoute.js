const express = require("express");
const router = express.Router();

const { authb, auth } = require("../middlewares/auth");

const {
  createPlayer,
  login,
  logout,
  summon
} = require("../controllers/playerController");

router.post("/", createPlayer);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/summon", auth, summon);

module.exports = router;
