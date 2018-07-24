// export { default as ruleObject } from './rule';
// export { default as nextGeneration } from './generation';

import { oneDimension as oneDimensionNeighborhoodStateExtractor } from './neighborhoodStateExtractor';
import { oneDimension as oneDimensionStateReducer } from './stateReducer';
import { oneDimension as oneDimensionRuleApplicator } from './ruleApplicator';
// import { oneDimension as oneDimensionGenerationMaker } from './generationMaker';

export default class GenerationMaker {
  constructor(rule) {
    this.rule = rule;
  }

  set rule(rule) {
    this._rule = rule;
    this._ruleApplicator = oneDimensionRuleApplicator(rule);
  }

  get rule() {
    return this._rule;
  }

  _initGenerationMaker() {
    this._generationMaker = generationMaker(this._rule)
  }

  run(population) {
    return population.map((state, index) => {
      const neighborhoodState = oneDimensionNeighborhoodStateExtractor(index, population);
      const reducedState = oneDimensionStateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
      const newCellState = this._ruleApplicator(reducedState);
      return newCellState
    })
  }
}


export { GenerationMaker }
