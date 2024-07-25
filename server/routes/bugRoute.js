const express = require("express");
const router = express.Router();

const { createBug } = require("../controllers/bugController");

router.route("/").post(createBug);

module.exports = router;