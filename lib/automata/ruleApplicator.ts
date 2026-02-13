import type { OneDimensionResult, LifeLikeResult } from './stateReducer';

export class OneDimension {
  private _rule: number = 110;
  private _config: { states: number; cells: number } = { states: 2, cells: 3 };
  private _ruleObject: Record<number, number> = {};

  constructor() {
    this.updateRuleObject();
  }

  set rule(rule: number) {
    this._rule = rule;
    this.updateRuleObject();
  }

  get rule(): number {
    return this._rule;
  }

  set config(config: { states: number; cells: number }) {
    this._config = config;
  }

  get config() {
    return this._config;
  }

  get ruleObject() {
    return this._ruleObject;
  }

  neighborhoodRule(neighborhood: number): number {
    const mask = this._config.states ** neighborhood;
    return (this._rule & mask) === 0 ? 0 : 1;
  }

  updateRuleObject() {
    const neighborhoodVarieties = [...Array(this._config.cells ** this._config.states).keys()];
    this._ruleObject = neighborhoodVarieties.reduce(
      (acc: Record<number, number>, state: number) => {
        acc[state] = this.neighborhoodRule(state);
        return acc;
      },
      {}
    );
  }

  run({ ruleKey }: OneDimensionResult): number {
    return this._ruleObject[ruleKey];
  }
}

export interface LifeLikeRule {
  survive: number[];
  born: number[];
}

export class LifeLike {
  private _rule: LifeLikeRule = { survive: [2, 3], born: [3] };

  set rule(rule: LifeLikeRule) {
    this._rule = rule;
  }

  get rule(): LifeLikeRule {
    return this._rule;
  }

  run({ neighborStatesCount, cellState }: LifeLikeResult): number {
    const { survive, born } = this._rule;
    if (!survive || !born) return 0;
    if (cellState === 1 && survive.includes(neighborStatesCount[1])) return 1;
    if (cellState === 0 && born.includes(neighborStatesCount[1])) return 1;
    return 0;
  }
}
