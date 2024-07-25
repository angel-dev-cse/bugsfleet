const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var bugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  health: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
  attackRate: {
    // chance of an attack being successful
    type: Number,
    required: true,
  },
  attackSpeed: {
    // combat speed of an insect
    type: Number,
    required: true,
  },
});

//Export the model
module.exports = mongoose.model("Bug", bugSchema);
