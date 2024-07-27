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
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const player = await Player.findByCredentials(email, password);
  const token = await player.generateAuthToken();

  // matching token from generateAuthToken stored in mongodb
  res.cookie("token", token, {
    httpOnly: true, // client js can't accesss
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  });

  res.json({ player, token });
});

const logout = asyncHandler(async (req, res) => {
  // remove the token type "auth" from tokens array from mongodb and clear cookie
  // assign the new tokens array without the "auth" token

  req.player.tokens = req.player.tokens.filter(
    (token) => token.type !== "auth"
  );

  res.clearCookie("token");

  await req.player.save();

  res.json({ message: "Logged out" });
});



module.exports = {
  createPlayer,
  login,
  logout
};
