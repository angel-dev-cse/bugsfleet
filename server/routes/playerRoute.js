const express = require("express");
const router = express.Router();

const { createPlayer } = require("../controllers/playerController");

router.route("/").post(createPlayer);

module.exports = router;