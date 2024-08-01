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
  rewards: {
    experience: Number,
    rank: Number,
    genes: Number,
    pheromones: Number,
    eggs: Number,
  },
  invader: playerSchema,
  defender: playerSchema,
  rounds: [battleRoundSchema],
  createdAt: { type: Date, default: Date.now },
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

  return [
    [first, firstBug],
    [second, secondBug],
  ];
};

// fight between the two players
battleSchema.methods.battle = async function () {
  const Player = require("../models/PlayerModel");
  // for finding updated player info (ig name, etc)
  const iPlayer = await Player.findById(this.invader.player);
  const dPlayer = await Player.findById(this.defender.player);

  // create a deep copy of the teams as backup
  const backupITeam = JSON.parse(JSON.stringify(this.invader.team));
  const backupDTeam = JSON.parse(JSON.stringify(this.defender.team));

  let winner;

  let iTeam = this.invader.team;
  let dTeam = this.defender.team;

  let round = 0;
  let first = 1;
  let second = 2;
  let iPos = 0;
  let dPos = 0;

  while (
    iTeam.length > 0 &&
    dTeam.length > 0 &&
    iPos < iTeam.length &&
    dPos < dTeam.length
  ) {
    round++;

    // fight(first turn, first bug pos in array, second turn, second bug pos in array)

    // console.log(await this.fight(1, 0, 2, 0));
    // this.fight(1, 0, 2, 0);
    let iResult, dResult;

    if (round == 1) {
      // first round, invader goes first - no change keep the initial values
      [iResult, dResult] = await this.fight(first, iPos, second, dPos, round);
    } else {
      // if first turn is invader team (first=1), check if the invader's attack speed is greater than the defender's attack speed

      // if not, switch the turns
      // invader has first priority if the attackspeed is the same
      if (
        first == 1
          ? iTeam[iPos].attackSpeed >= dTeam[dPos].attackSpeed
          : dTeam[iPos].attackSpeed > iTeam[dPos].attackSpeed
      ) {
        [iResult, dResult] = await this.fight(first, iPos, second, dPos, round);
      } else {
        first = 2;
        second = 1;

        [dResult, iResult] = await this.fight(first, dPos, second, iPos, round);
      }
    }

    // update the teams based on result
    // first bug is dead
    if (iResult[1].health <= 0) {
      iTeam[iPos] = iResult[1];
      // move onto the next bug of invader team
      // console.log(iResult[1].name, iResult[1].health);
      iPos++;
      // console.log("Invader iPos ", iPos);
    } else {
      // update the first bug info
      iTeam[iPos] = iResult[1];
    }

    if (dResult[1].health <= 0) {
      dTeam[0] = dResult[1];
      // move onto the next bug of defender team
      // console.log(dResult[1].name, dResult[1].health);
      dPos++;
      // console.log("Defender dPos ", dPos);
    } else {
      // update the second bug info
      dTeam[0] = dResult[1];
    }
  }

  // reward the winner with genes, pheromones, eggs based on the opponent's rank points
  // Calculate experience, rank points based on the opponent's rank points
  let rankDiffer = Math.abs(dPlayer.rank - iPlayer.rank);

  if (rankDiffer < 20) {
    rankDiffer = 20;
  }

  const experience = rankDiffer * 1.5;
  const rank = rankDiffer > 50 ? 50 : rankDiffer;
  const genes = rankDiffer * 1.5 > 5 ? 5 : rankDiffer * 1.5;
  const pheromones = rankDiffer * 1.5 > 5 ? 5 : rankDiffer * 1.5;
  const eggs = 3;

  if (this.invader.team.length > 0) {
    this.winner.player = this.invader.player._id;
    this.winner.team = this.invader.team;
    winner = iPlayer;

    // add the battle entries
    iPlayer.battleRecords.push({
      battle_id: this._id,
      win: true,
    });
    iPlayer.counts.battle.won++;
    dPlayer.battleRecords.push({ battle_id: this._id, win: false });
    dPlayer.counts.battle.lost++;
  } else {
    this.winner.player = this.defender.player._id;
    this.winner.team = this.defender.team;
    winner = dPlayer;

    // add the battle entries
    dPlayer.battleRecords.push({
      battle_id: this._id,
      win: true,
    });
    dPlayer.counts.battle.won++;
    iPlayer.battleRecords.push({ battle_id: this._id, win: false });
    iPlayer.counts.battle.lost++;
  }

  // add rewards to the winner
  winner.inventory.experience += experience;
  winner.inventory.rank += rank;
  winner.inventory.genes += genes;
  winner.inventory.pheromones += pheromones;
  winner.inventory.eggs += eggs;

  this.rewards = {
    experience,
    rank,
    genes,
    pheromones,
    eggs,
  };

  // after the battle ends restore the original teams
  this.invader.team = backupITeam;
  this.defender.team = backupDTeam;

  // save the data
  await this.save();
  await iPlayer.save();
  await dPlayer.save();

  return this;
};

//Export the model
module.exports = mongoose.model("Battle", battleSchema);
