const mongoose = require("mongoose"); // Erase if already required

// Subdocument schema for players in battle
let playerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.ObjectId.ObjectId,
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
      attackSpeed: {
        type: Number,
        required: true,
      },
      attackRate: {
        type: Number,
        required: true,
      },
    },
  ],
  rounds: [battleRoundSchema],
});

// subdocument schema for battle rounds
let battleRoundSchema = new mongoose.Schema({
  rounds: {
    type: Number,
    required: true,
  },
  // based on combat speed except for the first round where the attacker always goes first
  firstTurn: playerSchema,
  secondTurn: playerSchema,
  damage: {
    type: Number,
    required: true,
  },
});

// Declare the Schema of the Mongo model
var battleSchema = new mongoose.Schema({
  winner: {
    type: mongoose.Schema.ObjectId.ObjectId,
    ref: "Player",
  },
  invader: playerSchema,
  defender: playerSchema,
});


battleSchema.methods.fight() = async function(first, firstBugPos, second, secondBugPos) {
    if(first == 1) {
        first = this.invader;
        second = this.defender; 
    } else {
        first = this.defender;
        second = this.invader;
    }

    let firstBug = first.team[firstBugPos];
    let secondBug = second.team[secondBugPos];

    
    // two bugs fight each other
    // first turn
    const chance = Math.random()*100;
    if(firstBug.attackRate > chance) {
        secondBug.health -= firstBug.power;
    }
    // second turn (attack only if the bug has health)
    if(secondBug.health > 0) {
        if(secondBug.attackRate > chance) {
            firstBug.health -= secondBug.power;
        }
    }

    console.log([first, firstBug, second, secondBug]);
    return [first, firstBug, second, secondBug];
}

battleSchema.methods.battle() = async function() {
    // battle between two players
    let invader = this.invader;
    let defender = this.defender;

    // sort the teams based on attack speed ()
    invader.team.sort((a, b) => b.attackSpeed - a.attackSpeed);
    defender.team.sort((a, b) => b.attackSpeed - a.attackSpeed);

    let round = 0;

    while(invader.team.length > 0 && defender.team.length > 0) {
        round++;

        // fight(first turn, first bug pos in array, second turn, second bug pos in array)

        console.log(fight([1, 0, 2, 0]));

        if(round == 1) {
            // first round, invader goes first
            [invader.team[0], defender.team[0]] = fight(invader, defender);
        } else {
            if(invader.team[0].bug.attackSpeed > defender.team[0].bug.attackSpeed) {
                [invader.team[0], defender.team[0]] = fight(invader, defender);
            } else {
                [defender.team[0], invader.team[0]] = fight(defender, invader);
            }
        }
        // temporary
        break;
    }

    if(invader.team.length > 0) {
        this.winner = invader.player;
    } else {
        this.winner = defender.player;
    }

    return this;
};

//Export the model
module.exports = mongoose.model("Battle", battleSchema);
