const asyncHandler = require("express-async-handler");
const Player = require("../models/PlayerModel");
const Bug = require("../models/BugModel");

const summon = asyncHandler(async (req, res) => {
  const player = req.player;

  if (player.storage.length >= 30) {
    res.json({
      message: "Storage full! Please empty some slots before summmoning again!",
    });
    return;
  }
  // summon() method in PlayerModel.js
  const result = await player.summon();

  if (result.success) {
    res.json({ message: result.message, bug: result.bug });
  } else {
    res.json(result.message);
  }
});

// @desc Remove a bug from storage
// @route DELETE /api/player/storage
// @access Private
// @returns array of bugs in storage
const removeFromStorage = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  // slot_id is storage slot id not the bug id
  const slotID = req.body.storage_slot_id;

  if (slotID) {
    const index = player.storage.findIndex((slot) => {
      return slot._id.toString() === slotID;
    });

    if (index === -1) {
      res.status(400).json({ message: "Bug not found in storage!" });
      return;
    }

    const bugObj = player.storage[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } removed from the storage! Remaining bugs in storage: ${
          player.storage.length - 1
        }`,
      });
    }

    player.storage.splice(index, 1);

    await player.save();
  } else {
    res.status(400).json({ message: "Empty request!" });
    return;
  }
});

// @desc Get player storage
// @route GET /api/player/storage
// @access Private
// @returns array of bugs in storage
const getStorage = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const storage = req.player.storage;
  let bugs = [];

  for (const bugObj of storage) {
    const bug = await Bug.findById(bugObj.bug);

    if (bug) {
      bugs.push({
        _id: bug._id,
        storage_slot_id: bugObj._id,
        name: bug.name,
        class: bug.class,
        health: bug.health,
        power: bug.power,
        attackRate: bug.attackRate,
        attackSpeed: bug.attackSpeed,
        rank: bugObj.rank, // Ensure rank is included in the final response
      });
    }
  }

  res.json(bugs);
});

// @desc Adds a bug to the player's team from storage
// @route POST /api/player/team
// @access Private
// @returns array of bugs in team
const addToTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  const slotID = req.body.slot_id; // which slot's bug to add to team

  if (slotID) {
    if (player.team.length >= 5) {
      res.json({
        message: "Team full! Please remove a bug before adding another!",
      });
      return;
    }

    const index = player.storage.findIndex(
      (slot) => slot._id.toString() === slotID
    );

    if (index === -1) {
      res.json({ message: "Bug not found in storage!" });
      return;
    }

    // show confirmation message
    const bugObj = player.storage[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } added to active team! Total bugs in team: ${player.team.length + 1}`,
      });
    }

    player.team.push(player.storage[index]);
    player.storage.splice(index, 1);

    await player.save();
  } else {
    res.status(400).json({ message: "Empty request!" });
  }
});

// @desc Remove from team and add back to storage
// @route DELETE /api/player/team
// @access Private
// @returns array of bugs in team
const removeFromTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const player = req.player;
  // slot_id is team slot id not the bug id
  const slotID = req.body.team_slot_id;

  if (slotID) {
    const index = player.team.findIndex((slot) => {
      return slot._id.toString() === slotID;
    });

    if (index === -1) {
      res.status(400).json({ message: "Bug not found in team!" });
      return;
    }

    const bugObj = player.team[index];
    const bug = await Bug.findById(bugObj.bug);
    if (bug) {
      res.status(201).json({
        message: `${bugObj.rank}* ${
          bug.name
        } removed from the team! Remaining bugs in team: ${
          player.team.length - 1
        }`,
      });
    }

    player.team.splice(index, 1);

    // Return the bug to storage
    player.storage.push(bugObj);

    await player.save();
  } else {
    res.status(400).json({ message: "Empty request!" });
    return;
  }
});

// @desc Get player team
// @route GET /api/player/team
// @access Private
// @returns array of bugs in team
const getTeam = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");
  const team = req.player.team;
  let bugs = [];

  for (const bugObj of team) {
    const bug = await Bug.findById(bugObj.bug);

    if (bug) {
      bugs.push({
        _id: bug._id,
        team_slot_id: bugObj._id,
        name: bug.name,
        class: bug.class,
        health: bug.health,
        power: bug.power,
        attackRate: bug.attackRate,
        attackSpeed: bug.attackSpeed,
        rank: bugObj.rank, // Ensure rank is included in the final response
      });
    }
  }

  res.json(bugs);
});

// @desc Merge two bugs: 1*-75%, 2*-55%, 3*-40%, 4*-25% | 1*+1*=2*, 2*+2*=3*, 3*+3*=4* | Gene increases chance by 25% | delete second copy and increase rank of first one by 1
// @input slot_id_1 and slot_id_2 (team and storage slot id are same)
// @output success or failure message
// @route POST /api/player/merge
// @access Private
const merge = asyncHandler(async (req, res) => {
  const Bug = require("../models/BugModel");

  // req.body format {slot_id_1: "id", slot_type_1:"team/storage", slot_id_2: "id", slot_type_2:"team/storage"}
  const player = req.player;
  const slotID1 = req.body.slot_id_1;
  const slotID2 = req.body.slot_id_2;

  // slotType1 and slotType2 are arrays of bugs so we can avoid searching and writing extra codes

  let slotType1 = [];
  let slotType2 = [];

  if (req.body.slot_type_1 === "storage") {
    slotType1 = player.storage;
  } else {
    slotType1 = player.team;
  }
  if (req.body.slot_type_2 === "storage") {
    slotType2 = player.storage;
  } else {
    slotType2 = player.team;
  }

  if (slotID1 && slotID2 && slotID1 !== slotID2) {
    const index1 = slotType1.findIndex(
      (slot) => slot._id.toString() === slotID1
    );
    const index2 = slotType2.findIndex(
      (slot) => slot._id.toString() === slotID2
    );

    // if any of them are missing
    if (index1 === -1 || index2 === -1) {
      res.status(400).json({ message: "Invalid bugs select for merge" });
      return;
    }

    const bugObj1 = slotType1[index1];
    const bugObj2 = slotType2[index2];
    const bug1 = await Bug.findById(bugObj1.bug);
    const bug2 = await Bug.findById(bugObj2.bug);

    // ensure both bugs are of the same name and same rank
    if (bugObj1.rank !== bugObj2.rank || bug1.name !== bug2.name) {
      res
        .status(400)
        .json({ message: "Bugs must be of the same name and rank" });
      return;
    }

    // calculate the merge chance
    const chance = Math.random() * 100;
    // Assign success chance based on rank
    let successChance = 0;
    if (bugObj1.rank === 1) {
      successChance = 75;
    } else if (bugObj1.rank === 2) {
      successChance = 55;
    } else if (bugObj1.rank === 3) {
      successChance = 40;
    } else {
      successChance = 25;
    }

    console.log(
      `For upgrading ${bugObj1.rank}* ${bug1.name} success chance is ${successChance}%`
    );

    if (chance > successChance) {
      // incrase the rank of the first bug by 1
      bugObj1.rank += 1;
      // remove the second bug
      slotType2.splice(index2, 1);

      await player.save();

      res.status(201).json({
        message: `Merge successful! ${bugObj1.rank - 1}* ${
          bug1.name
        } upgraded to ${bugObj1.rank}*`,
      });
    } else {
      // give compensation with gene fragments (15 times the rank of the bugs)
      const geneFragment = bugObj1.rank * 15;
      player.inventory.geneFragment += geneFragment;
      // remove the second bug
      slotType2.splice(index2, 1);

      await player.save();

      res.status(201).json({
        message: `Merge failed! ${bugObj2.rank}* ${bug2.name} lost in the process. You received ${geneFragment} gene fragments as compensation!`,
      });
    }
  } else {
    res.status(400).json({ message: "Empty request!" });
  }
});

module.exports = {
  summon,
  removeFromStorage,
  getStorage,
  addToTeam,
  removeFromTeam,
  getTeam,
  merge,
};
