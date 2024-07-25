const express = require("express");
const router = express.Router();

const {
  createPlayer,
  loginPlayer,
} = require("../controllers/playerController");

router.post("/", createPlayer);
router.post("/login", loginPlayer);

module.exports = router;
