const express = require("express");
const router = express.Router();

const { authb, auth } = require("../middlewares/auth");

const {
  createPlayer,
  login,
  logout,
  summon,
  getStorage,
  getTeam,
  removeFromStorage,
  addToTeam,
  removeFromTeam
} = require("../controllers/playerController");

router.post("/", createPlayer);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/summon", auth, summon);
router.delete("/storage", auth, removeFromStorage);
router.get("/storage", auth, getStorage);
router.post("/team", auth, addToTeam);
router.delete("/team", auth, removeFromTeam);
router.get("/team", auth, getTeam);

module.exports = router;
