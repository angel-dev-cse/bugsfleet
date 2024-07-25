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

// @desc Login an Player
// @route POST /api/Player/login
// @access Public
const loginPlayer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const player = await Player.findByCredentials(email, password);
  const token = await player.generateAuthToken();
  res.json({ player, token });
});

module.exports = { createPlayer, loginPlayer };
