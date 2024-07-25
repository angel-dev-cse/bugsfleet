const updateDB = (command, type) => {
  const { insects, players } = require("./utils/tempDatabase");

  if (type == "p") {
    // update player data
    // possbile ommmand : [PLAYER ID","PATH">"PATH">"PATH","VALUE]"
    const playerID = command[0];
    const PATH = command[1];
    const VALUE = command[2];
  }
};

/* "11": {
    name: "Player 1",
    description: "Fight is in my blood - Blue that is",
    nature: "Attacking",
    team: [
      [1, 2],
      [2, 3],
      [1, 1],
      [3, 2],
      [2, 2],
    ],
    inventory: [
      [1, 2],
      [2, 3],
      [1, 1],
      [3, 2],
      [2, 2],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  },*/

const savePlayer = (playerID, data) => {
    
};
