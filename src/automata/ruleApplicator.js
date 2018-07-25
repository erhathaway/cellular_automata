// a simple 1D cellular automata program has two states (0, 1) and three cells ( 2 neighbors and itself)
class OneDimension {
  constructor() {
    this._ruleObject = undefined;
    this.config = { states: 2, cells: 3 };
    this.rule = 110;
  }

  set rule(rule) {
    this._rule = rule;
    this.updateRuleObject();
  }

  set config(config) {
    this._config = config;
  }

  get rule() {
    return this._rule;
  }

  get config() {
    return this._config;
  }

  get ruleObject() {
    return this._ruleObject
  }

  neighborhoodRule(neighborhood) {
    /* example:
      If rule = 110 and neighborhood = 7 (seven being the largest index - since there are 8 total),
      we want to mask the 6 earlier neighborhoods and
      see if the remaining neighborhood rule in 110 is >1 or = 0 (indicating rule)
    */
    const mask = this.config.states ** neighborhood;
    return (this.rule & mask) === 0 ? 0 : 1; // represent the two rule states for a neighborhood
  }

  updateRuleObject() {
    /* returns an object
      the keys are the neighborhood index
      the value is a state (1 or 0)
    */
    const neighborhoodVarieties = [...Array(this.config.cells ** this.config.states).keys()]; // [0,1,2,3,4,5,6,7] the eight possible neighborhoods
    this._ruleObject = neighborhoodVarieties.reduce(
      (acc, state) => {
        acc[state] = this.neighborhoodRule(state);
        return acc;
      },
    {});
  }

  run({ ruleKey }) {
    return this.ruleObject[ruleKey]
  }
}

class LifeLike {
  constructor() {
    this.rule = { survive: [2, 3], born: [3] };
  }

  set rule(rule) {
    this._rule = rule;
  }
  get rule() {
    return this._rule;
  }

  run({ neighborStatesCount, cellState }) {
    if (cellState === 1 && this.rule.survive.includes(neighborStatesCount[1])) return 1;
    else if (cellState === 0 && this.rule.born.includes(neighborStatesCount[1])) return 1;
    else return 0;
  }
}

export { OneDimension, LifeLike }
