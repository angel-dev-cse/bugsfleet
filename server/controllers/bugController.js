const asyncHandler = require("express-async-handler");
const Bug = require("../models/BugModel");

// @desc Create an Bug
// @route POST /api/Bugs
// @access Private
const createBug = asyncHandler(async (req, res) => {
  const bug = new Bug(req.body);
  await bug.save();
  res.status(201).json(bug);
});

// @desc    Fetch all Bugs
// @route   GET /api/Bugs
// @access  Public
const getBugs = asyncHandler(async (req, res) => {
  const bugs = await Bug.find({});
  res.json(bugs);
});

// @desc    Fetch a random bug
// @route   GET /api/Bugs
// @access  Public
const getRandomBug = asyncHandler(async (req, res) => {
  const bug = await Bug.aggregate([{ $sample: { size: 1 } }]);
  res.json(bug);
});

module.exports = { createBug, getBugs, getRandomBug };
