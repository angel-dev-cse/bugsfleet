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

bugSchema.methods.attack = function () {
  const chance = Math.random() * 100;
  const finalAttackRate = this.attackRate * this.rank;
  const totalPower = this.power * this.rank;

  if (finalAttackRate > chance) {
    console.log(
      `${this.name} successfully attacked with ${totalPower} damages\n${chance}%`
    );
  } else {
    console.log(`${this.name} failed to attack\n${chance}%`);
  }
};

//Export the model
module.exports = mongoose.model("Bug", bugSchema);
