const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Subdocument schema for battle records
const battleRecordSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Battle",
  },
  result: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Subdocument schema for bugs in team and inventory
const playerBugSchema = new mongoose.Schema({
  bug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bug",
    required: true,
  },
  rank: {
    type: Number,
    default: 1,
    enum: [1, 2, 3, 4],
  },
});

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: "player",
  },
  status: {
    type: String,
    trim: true,
  },
  rank: {
    // Show leaderboard based on rank points
    type: Number,
    default: 0,
  },
  league: {
    // Will show appropriate ranks later form another array
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
  },
  experience: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  team: [playerBugSchema],
  storage: [playerBugSchema],
  inventory: {
    eggs: {
      type: Number,
      default: 0,
    },
    genes: {
      type: Number,
      default: 0,
    },
    pheromones: {
      type: Number,
      default: 0,
    },
    // gene fragments, pheromone fragments and eggs are obtainable from battles
    geneFragment: {
      type: Number,
      default: 0,
    },
    pheromoneFragment: {
      type: Number,
      default: 0,
    },
    // eggshells are obtainable from failed summons 100 shells = 1 egg
    eggshell: {
      type: Number,
      default: 0,
    },
  },
  // should have battle records
  battleRecords: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["auth", "reset"],
      },
    },
  ],
});

// Pre-save middleware to hash the password before saving
playerSchema.pre("save", async function (next) {
  const player = this;
  if (player.isModified("password")) {
    player.password = await bcrypt.hash(player.password, 8);
  }
  next();
});

// Method to generate auth token
playerSchema.methods.generateAuthToken = async function () {
  const player = this;
  const token = jwt.sign(
    { _id: player._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: "3 days",
    }
  );

  // remove old tokens of "auth" type and add the new "auth" token in the array
  player.tokens = player.tokens.filter((token) => token.type !== "auth");
  player.tokens = player.tokens.concat({ token, type: "auth" });

  await player.save();
  return token;
};

// Method to find player by credentials
playerSchema.statics.findByCredentials = async (email, password) => {
  const player = await Player.findOne({ email });
  if (!player) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, player.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return player;
};

// Method to hide sensitive data
playerSchema.methods.toJSON = function () {
  const player = this;
  const playerObject = player.toObject();

  delete playerObject.password;
  delete playerObject.tokens;

  return playerObject;
};

// Summon a bug
playerSchema.methods.summon = async function () {
  const bugController = require("../controllers/bugController");

  if (this.inventory.eggs > 0) {
    this.inventory.eggs -= 1;
    const chance = Math.random() * 100;

    if (chance > 85) {
      const bug = await bugController.getRandomBug();
      this.storage.push({ bug: bug[0]._id, rank: 1 });
      await this.save();
      return {
        success: true,
        message: `Summmoned 1* ${bug[0].name}! Bugs in storage: ${this.storage.length}`,
        bug: bug,
      };
    } else {
      // failed summon compensates with eggshells
      const eggshell = Math.ceil(chance / 2);
      this.inventory.eggshell += eggshell;
      await this.save();
      return { success: false, message: `Failed to summon a bug! Awarded ${eggshell} eggshells!` };
    }
  } else {
    return { success: false, message: "Not enough eggs!" };
  }
};

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;
