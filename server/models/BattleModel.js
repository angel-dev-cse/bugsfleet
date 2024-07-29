const mongoose = require("mongoose"); // Erase if already required

// Subdocument schema for players in battle
let playerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  team: [
    {
      name: {
        type: String,
        required: true,
      },
      rank: {
        type: Number,
        required: true,
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
        type: Number,
        required: true,
      },
      attackSpeed: {
        type: Number,
        required: true,
      },
    },
  ],
});

// subdocument schema for battle rounds
let battleRoundSchema = new mongoose.Schema({
  round: {
    type: Number,
    required: true,
  },
  // based on combat speed except for the first round where the attacker always goes first
  firstTurn: {
    type: Number,
    required: true,
  },
  secondTurn: {
    type: Number,
    required: true,
  },
  firstBugPos: {
    type: Number,
    required: true,
  },
  secondBugPos: {
    type: Number,
    required: true,
  },
  firstDamage: {
    type: Number,
    required: true,
  },
  secondDamage: {
    type: Number,
    required: true,
  },
  firstHealth: {
    type: Number,
    required: true,
  },
  secondHealth: {
    type: Number,
    required: true,
  },
});

// Declare the Schema of the Mongo model
var battleSchema = new mongoose.Schema({
  winner: {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    team: {}, // team after the battle
  },
  invader: playerSchema,
  defender: playerSchema,
  rounds: [battleRoundSchema],
});

// fight between two bugs
battleSchema.methods.fight = async function (
  first,
  firstBugPos,
  second,
  secondBugPos,
  round
) {
  let firstPlayer = this.invader;
  let secondPlayer = this.defender;

  if (first == 2) {
    firstPlayer = this.defender;
    secondPlayer = this.invader;
  }

  //   console.log([first, firstBugPos, second, secondBugPos]);

  let firstBug = firstPlayer.team[firstBugPos];
  let secondBug = secondPlayer.team[secondBugPos];

  // firstBugHealth(after battle), firstBugDamage(if any), secondBugHealth(after battle), secondBugDamage(if any)
  let roundRecord = [firstBug.health, 0, secondBug.health, 0];

  // two bugs fight each other
  // first turn
  let chance = Math.random() * 100;
  if (firstBug.attackRate > chance) {
    secondBug.health -= firstBug.power;

    // text log for visaualization
    if (first == 1) {
      console.log(
        `Invader's ${firstBug.rank}* ${firstBug.name} attacks for ${firstBug.power} damage`
      );
    } else {
      console.log(
        `Defenders's ${firstBug.rank}* ${firstBug.name} attacks for ${firstBug.power} damage`
      );
    }

    roundRecord[1] = firstBug.power;
    roundRecord[2] = secondBug.health;
  } else {
    if (first == 1) {
      console.log(
        `Invader's ${firstBug.rank}* ${firstBug.name} misses the attack`
      );
    } else {
      console.log(
        `Defenders's ${firstBug.rank}* ${firstBug.name} misses the attack`
      );
    }
  }

  // second turn (attack only if the bug has health)
  chance = Math.random() * 100;
  if (secondBug.health > 0) {
    if (secondBug.attackRate > chance) {
      firstBug.health -= secondBug.power;

      // text log for visaualization
      if (second == 1) {
        console.log(
          `Invader's ${secondBug.rank}* ${secondBug.name} attacks for ${secondBug.power} damage`
        );
      } else {
        console.log(
          `Defenders's ${secondBug.rank}* ${secondBug.name} attacks for ${secondBug.power} damage`
        );
      }

      roundRecord[3] = secondBug.power;
      roundRecord[0] = firstBug.health;
    } else {
      if (second == 1) {
        console.log(
          `Invader's ${secondBug.rank}* ${secondBug.name} misses the attack`
        );
      } else {
        console.log(
          `Defenders's ${secondBug.rank}* ${secondBug.name} misses the attack`
        );
      }
    }
  }

  this.rounds.push({
    round: round,
    firstTurn: first,
    secondTurn: second,
    firstBugPos: firstBugPos,
    secondBugPos: secondBugPos,
    firstDamage: roundRecord[1],
    secondDamage: roundRecord[3],
    firstHealth: roundRecord[0],
    secondHealth: roundRecord[2],
  });

  return [first, firstBug, second, secondBug];
};

// fight between the two players
battleSchema.methods.battle = async function () {
  const Player = require("../models/PlayerModel");
  // for finding updated player info (ig name, etc)
  const iPlayer = await Player.findById(this.invader.player);
  const dPlayer = await Player.findById(this.defender.player);

  // create a copy of the teams as backup
  const backupITeam = [...this.invader.team];
  const backupDTeam = [...this.defender.team];

  let iTeam = this.invader.team;
  let dTeam = this.defender.team;
  // console.log("Invader", this.invader);

  // return;

  // this.prepareBattle();

  // sort the teams based on attack speed
  // invader.team.sort((a, b) => b.attackSpeed - a.attackSpeed);
  // defender.team.sort((a, b) => b.attackSpeed - a.attackSpeed);

  let round = 0;
  let firstPos = 0;
  let secondPos = 0;

  while (
    iTeam.length > 0 &&
    dTeam.length > 0 &&
    firstPos < iTeam.length &&
    secondPos < dTeam.length
  ) {
    round++;

    // fight(first turn, first bug pos in array, second turn, second bug pos in array)

    // console.log(await this.fight(1, 0, 2, 0));
    [];
    // this.fight(1, 0, 2, 0);
    let first = 1;
    let second = 2;
    let result = [];

    if (round == 1) {
      // first round, invader goes first - no change keep the initial values
    } else {
      if (iTeam[0].attackSpeed > dTeam[0].attackSpeed) {
        // no change as well
      } else {
        first = 2;
        second = 1;
      }
    }

    result = await this.fight(first, firstPos, second, secondPos, round);

    // update the teams based on result
    // first bug is dead
    if (result[1].health <= 0) {
      if (first == 1) {
        // move onto the next bug in the first team
        firstPos++;
      } else {
        // move onto the next bug in the first team
        secondPos++;
      }
    } else {
      // update the first bug info
      if (first == 1) {
        iTeam[0] = result[1];
      } else {
        dTeam[0] = result[1];
      }
    }
    //second bug is dead
    if (result[3].health <= 0) {
      if (second == 1) {
        // move onto the next bug in the first team
        firstPos++;
      } else {
        // move onto the next bug in the first team
        secondPos++;
      }
    } else {
      // update the second bug info
      if (second == 1) {
        iTeam[0] = result[3];
      } else {
        dTeam[0] = result[3];
      }
    }

    // console.log(result);
    // console.log(iTeam, dTeam);
  }

  if (this.invader.team.length > 0) {
    this.winner.player = this.invader.player._id;
    this.winner.team = this.invader.team;
  } else {
    this.winner.player = this.defender.player._id;
    this.winner.team = this.defender.team;
  }

  // after the battle ends restore the original teams
  this.invader.team = backupITeam;
  this.defender.team = backupDTeam;

  return this;
};

//Export the model
module.exports = mongoose.model("Battle", battleSchema);
