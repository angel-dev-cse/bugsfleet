const express = require("express");
const router = express.Router();
const { authb, auth } = require("../middlewares/auth");
const {
  summon,
  removeFromStorage,
  getStorage,
  addToTeam,
  removeFromTeam,
  getTeam,
  merge
} = require("../controllers/gameController");

router.get("/summon", auth, summon);
router.delete("/storage", auth, removeFromStorage);
router.get("/storage", auth, getStorage);
router.post("/team", auth, addToTeam);
router.delete("/team", auth, removeFromTeam);
router.get("/team", auth, getTeam);
router.post("/merge", auth, merge);

module.exports = router;