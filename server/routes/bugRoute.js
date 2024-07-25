const express = require("express");
const router = express.Router();

const { createBug, getBugs, getRandomBug } = require("../controllers/bugController");

router.route("/").post(createBug).get(getBugs);
router.get("/random", getRandomBug);

module.exports = router;