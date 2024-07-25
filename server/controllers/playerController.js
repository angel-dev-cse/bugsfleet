const Player = require("../models/PlayerModel");
const asyncHandler = require("express-async-handler");

// @desc Create an Player
// @route POST /api/Player
// @access Public
const createPlayer = asyncHandler(async (req, res) => {
  const player = new Player(req.body);
  await player.save();
  res.status(201).json(player);
});

module.exports = { createPlayer };
