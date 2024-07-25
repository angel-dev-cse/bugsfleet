class War {
  rounds = 5;

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }

  war() {
    // get rearranged team
    let team1 = this.player1.getTeam();
    let team2 = this.player2.getTeam();

    console.log(team1, "VS", team2);
    console.log("==================== FIGHT STARTING ====================");

    let round = 0;

    // fight until one team is defeated
    while (team1.length > 0 && team2.length > 0) {
      round++;
      console.log(`========== Round ${round} ==========`);
      // if the teams are already sorted by attack speed then take the first one
      let insect1 = team1[0];
      let insect2 = team2[0];

      let result;

      // TODO: Attacker advantage only works for the first round. After that who attacks first depends on attack speed
      // if first insect has higher attack speed then continue regardless of the round
      if (insect1[3] > insect2[3]) {
        result = this.fight(insect1, insect2);
      } else {
        if (round == 1) {
          // othewise bypass if this is the first round
          result = this.fight(insect1, insect2);
        } else {
          // if not then switch the order and let the second insect attack first
          result = this.fight(insect2, insect1);
        }
      }

      let insect1R = result[0];
      let insect2R = result[1];

      console.log("Aftermath:\n", insect1R, insect2R);

      if (insect1R[0] > 0 && insect2R[0] > 0) {
        // update both insects if both are alive
        // teamX[0] should always return the first element as the arry is not empty
        team1[0] = insect1R;
        team2[0] = insect2R;
      } else if (insect1R[0] > 0) {
        // update first insect only
        team1[0] = insect1R;
        // kick the second insect from team
        team2.shift();

        console.log(
          `${this.player2.name}'s ${insect2R[5]}* ${insect2R[4]} lost the fight`
        );
      } else if (insect2R[0] > 0) {
        // update second insect only
        team2[0] = insect2R;
        //kick the first insect from team
        team1.shift();

        console.log(
          `${this.player1.name}'s ${insect1R[5]}* ${insect1R[4]} lost the fight`
        );
      } else {
        // both dead (impossible to be as first one kills and second one can'tattack)
      }
    }

    console.log("==================== FIGHT FINISHED ====================");
    // Result Time
    if (team1.length > 0 && team2.length == 0) {
      console.log(`${this.player1.name} won the game with remaining `);
      console.log(team1);
    } else if (team1.length == 0 && team2.length > 0) {
      console.log(`${this.player2.name} won the game with remaining `);
      console.log(team2);
    }
  }

  fight(insect1, insect2) {
    console.log(insect1, "X", insect2);
    // have same success rate for both insects
    // const chance = Math.random() * 100;
    // have individual success rate for attacks - check attack()

    // if first insect attacks successfully, reduce health of the second insect by the damage of first insect
    if (this.attack(insect1[2])) {
      insect2[0] -= insect1[1];
      console.log(
        `${insect1[5]}* ${insect1[4]} did ${insect1[1]} damage to ${insect2[5]}* ${insect2[4]}`
      );
    }
    // if second insect attacks successfully, reduce health of the first insect by the damage of second insect
    // can only attack if it survives the attack of the first insect - Invader advantage
    if (this.attack(insect2[2]) && insect2[0] > 0) {
      insect1[0] -= insect2[1];
      console.log(
        `${insect2[5]}* ${insect2[4]} did ${insect2[1]} damage to ${insect1[5]}* ${insect1[4]}`
      );
    }

    return [insect1, insect2];
  }

  attack(attackRate) {
    const chance = Math.random() * 100;
    if (attackRate >= chance) {
      return 1;
    } else {
      return 0;
    }
  }
}

module.exports = War;
