class Insect {
  constructor(insect) {
    this.name = insect.name;
    this.health = insect.health;
    this.power = insect.power;
    this.attackRate = insect.attackRate;
    this.attackSpeed = insect.attackSpeed;
  }

  attack() {
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
  }

  speed() {
    return this.attackSpeed;
  }
}

module.exports = { Insect };