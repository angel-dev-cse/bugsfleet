const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  team: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "BugModel",
    default: [],
  },
  inventory: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "BugModel",
    default: [],
  },
});

//Export the model
module.exports = mongoose.model("player", playerSchema);
