const insects = {
  1: {
    name: "Mantis",
    health: 20,
    power: 15,
    attackRate: 18,
    attackSpeed: 33,
  },
  2: {
    name: "Spider",
    health: 25,
    power: 18,
    attackRate: 20,
    attackSpeed: 30,
  },

  3: {
    name: "Roach",
    health: 28,
    power: 28,
    attackRate: 18,
    attackSpeed: 20,
  },
};


// team and inventory [rank, insectID]
const players = {
  "11": {
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
  },
  12: {
    name: "Player 2",
    description: "Peaceful Player",
    nature: "Peaceful",
    team: [
      [1, 3],
      [2, 2],
      [2, 1],
      [3, 1],
      [2, 2],
    ],
    inventory: [
      [1, 3],
      [2, 2],
      [2, 1],
      [3, 1],
      [2, 2],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  },
};

module.exports = { insects, players };
