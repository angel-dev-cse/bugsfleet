class Player {
  constructor(playerID) {
    const { players } = require("../utils/tempDatabase");
    let player = players[playerID];
    this.playerID = playerID;
    this.name = player.name;
    this.description = player.description;
    this.nature = player.nature;
    this.team = player.team;
    this.inventory = player.inventory;
  }

  getTeam() {
    // return team summary consisting [Health, Power, Attack Rate, Attack Speed] sorted by Attack Speed
    let finalTeam = [];

    const { insects } = require("../utils/tempDatabase");

    this.team.forEach((i) => {
      let rank = i[0];
      let insect = insects[i[1]];
      let health = insect.health * rank;
      let power = insect.power * rank;
      let attackRate = insect.attackRate * rank;

      finalTeam.push([
        health,
        power,
        attackRate,
        insect.attackSpeed,
        insect.name,
        rank,
      ]);
    });

    return finalTeam.sort((a, b) => {
      if (a[3] < b[3]) return 1;
      if (a[3] > b[3]) return -1;
      if (a[3] == b[3]) return 0;
    });
  }

  getInvetory() {
    return this.inventory;
  }

  summon() {
    const { insects } = require("../utils/tempDatabase");
    // summons an insect
    const chance = Math.random() * 100;
    if (chance > 80) {
      const insectRoll = Math.ceil(Math.random() * 3);
      console.log(`You just summoned **${insects[insectRoll].name}**`);
    } else {
      console.log("Bad luck! Please try again later!");
    }
  }

  discard() {
    // discards a newly summoned insect
  }

  addToInventory() {
    // adds the newly summoned insect to player inventory
  }

  removeFromInventory() {
    // removes an insect from player inventory
  }

  addToTeam() {
    // add an insect from inventory to the active team
  }

  removeFromTeam() {
    // remove an active insect from the team
  }

  merge() {
    // try to merge to similar insects from inventory
  }

  save() {
    // sample data
    //     {
    //     name: "Player 1",
    //     description: "Fight is in my blood - Blue that is",
    //     nature: "Attacking",
    //     team: [
    //       [1, 2],
    //       [2, 3],
    //       [1, 1],
    //       [3, 2],
    //       [2, 2],
    //     ],
    //     inventory: [
    //       [1, 2],
    //       [2, 3],
    //       [1, 1],
    //       [3, 2],
    //       [2, 2],
    //       [1, 1],
    //       [2, 1],
    //       [3, 1],
    //     ],
    //   },
    // saves player data onto file
    const { Dirent, open, close, writeFile, openSync, opendir } = require("fs");

    let dirent = new Dirent();

    const playerDir = `./db/players/${this.playerID}.txt`;

    // maybe construct the whole string from object first then write it at the same time
    let dataString = "{\n";
    dataString += `name: ${this.playerID}\ndescription: ${this.description}\nnature: ${this.nature}\nteam: [`;
    //add the team
    this.team.forEach((insect) => {
      dataString += `[${insect},`;
    });
    dataString += `]`;

    if (!dirent.isFile(playerDir)) {
      //   mkdir(playerDir, { recursive: true }, (err) => {
      //     if (err) throw err;
      //   });

      //   close(playerDir);
    }

    writeFile(`../db/players/${this.playerID}.txt`, dataString, (err) => {
      if (err) console.log(`Failed to write file: ${err}`);
      else console.log("File written.");
    });
  }
}

module.exports = Player;
