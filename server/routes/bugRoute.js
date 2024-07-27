const express = require("express");
const router = express.Router();

const {authb, auth} = require("../middlewares/auth")
const { createBug, getBugs, getRandomBug } = require("../controllers/bugController");

router.route("/").post(createBug).get(getBugs);
router.get("/random", auth, getRandomBug);

module.exports = router;