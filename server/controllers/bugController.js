const asyncHandler = require("express-async-handler");
const Bug = require("../models/BugModel");

// @desc Create an Bug
// @route POST /api/Bugs
// @access Private
const createBug = asyncHandler(async (req, res) => {
  const Bug = new Bug(req.body);
  await Bug.save();
  res.status(201).json(Bug);
});

// @desc    Fetch all Bugs
// @route   GET /api/Bugs

module.exports = { createBug };
