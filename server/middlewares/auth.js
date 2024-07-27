const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Player = require("../models/PlayerModel");

// for testing stuff with bearer token
const authb = asyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);

      if (verified) {
        const player = await Player.findById(verified.id);
        req.player = player;
        next();
      }
    } catch (error) {
      throw new Error("Token is not valid");
    }
  } else {
    throw new Error("Not authorized");
  }
});

const auth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("Please login first!");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const player = await Player.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!player) {
      throw new Error("Invalid token! Please login again!");
    }

    req.token = token;
    req.player = player;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please login first!" });
  }
});

module.exports = {authb, auth};
