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

const summon = asyncHandler(async (req, res) => {
  const player = req.player;

  if (player.storage.length >= 30) {
    res.json({
      message: "Storage full! Please empty some slots before summmoning again!",
    });
    return;
  }
  // summon() method in PlayerModel.js
  const result = await player.summon();

  if (result.success) {
    res.json({ message: result.message, bug: result.bug });
  } else {
    res.json(result.message);
  }
});

// @desc Remove a bug from storage
// @route DELETE /api/player/storage
// @access Private
// @returns array of bugs in storage
const removeFromStorage = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  // slot_id is storage slot id not the bug id
  const slotID = req.body.storage_slot_id;

  if (slotID) {
    const index = player.storage.findIndex((slot) => {
      return slot._id.toString() === slotID;
    });

    if (index === -1) {
      res.status(400).json({ message: "Bug not found in storage!" });
      return;
    }

    const bugObj = player.storage[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } removed from the storage! Remaining bugs in storage: ${
          player.storage.length - 1
        }`,
      });
    }

    player.storage.splice(index, 1);

    await player.save();
  } else {
    res.status(400).json({ message: "Empty request!" });
    return;
  }
});

// @desc Get player storage
// @route GET /api/player/storage
// @access Private
// @returns array of bugs in storage
const getStorage = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const storage = req.player.storage;
  let bugs = [];

  for (const bugObj of storage) {
    const bug = await Bug.findById(bugObj.bug);

    if (bug) {
      bugs.push({
        _id: bug._id,
        slot_id: bugObj._id,
        name: bug.name,
        class: bug.class,
        health: bug.health,
        power: bug.power,
        attackRate: bug.attackRate,
        attackSpeed: bug.attackSpeed,
        rank: bugObj.rank, // Ensure rank is included in the final response
      });
    }
  }

  res.json(bugs);
});

// @desc Adds a bug to the player's team from storage
// @route POST /api/player/team
// @access Private
// @returns array of bugs in team
const addToTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  const slotID = req.body.slot_id; // which slot's bug to add to team

  if (slotID) {
    if (player.team.length >= 5) {
      res.json({
        message: "Team full! Please remove a bug before adding another!",
      });
      return;
    }

    const index = player.storage.findIndex((slot) => slot._id.toString() === slotID);

    if (index === -1) {
      res.json({ message: "Bug not found in storage!" });
      return;
    }

    // show confirmation message
    const bugObj = player.storage[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } added to active team! Total bugs in team: ${
          player.team.length + 1
        }`,
      });
    }

    player.team.push(player.storage[index]);
    player.storage.splice(index, 1);

    await player.save();
    console.log(player.team);
  } else {
    res.status(400).json({ message: "Empty request!" });
  }
});

// @desc Remove from team and add back to storage
// @route DELETE /api/player/team
// @access Private
// @returns array of bugs in team
const removeFromTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  // slot_id is team slot id not the bug id
  const slotID = req.body.team_slot_id;

  if (slotID) {
    const index = player.team.findIndex((slot) => {
      return slot._id.toString() === slotID;
    });

    if (index === -1) {
      res.status(400).json({ message: "Bug not found in team!" });
      return;
    }

    const bugObj = player.team[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } removed from the team! Remaining bugs in team: ${
          player.team.length - 1
        }`,
      });
    }

    player.team.splice(index, 1);

    // Return the bug to storage
    player.storage.push(bugObj);

    await player.save();
  } else {
    res.status(400).json({ message: "Empty request!" });
    return;
  }
});

// @desc Get player team
// @route GET /api/player/team
// @access Private
// @returns array of bugs in team
const getTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const team = req.player.team;
  let bugs = [];

  for (const bugObj of team) {
    const bug = await Bug.findById(bugObj.bug);

    if (bug) {
      bugs.push({
        _id: bug._id,
        team_slot_id: bugObj._id,
        name: bug.name,
        class: bug.class,
        health: bug.health,
        power: bug.power,
        attackRate: bug.attackRate,
        attackSpeed: bug.attackSpeed,
        rank: bugObj.rank, // Ensure rank is included in the final response
      });
    }
  }

  res.json(bugs);
});

module.exports = {
  createPlayer,
  login,
  logout,
  summon, //adds to storage (if space)
  removeFromStorage,
  getStorage,
  addToTeam, //adds to team (if space)
  removeFromTeam,
  getTeam,
};
