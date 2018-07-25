// export { default as ruleObject } from './rule';
// export { default as nextGeneration } from './generation';

import { oneDimension as oneDimensionNeighborhoodStateExtractor } from './neighborhoodStateExtractor';
import { oneDimension as oneDimensionStateReducer } from './stateReducer';
import { oneDimension as oneDimensionRuleApplicator } from './ruleApplicator';
import { oneDimension as oneDimensionPopulationMap, twoDimension as twoDimensionPopulationMap } from './populationMap';

// import { oneDimension as oneDimensionGenerationMaker } from './generationMaker';

export default class GenerationMaker {
  constructor(rule) {
    this.rule = rule;
    this.generationRate = 0;
    this.totalTimeSpentGenerating = 0;
    this.generationNumber = 0;
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

  oneDimensionGenerationGenerator(currentPopulation) {
    const populationIterable = oneDimensionPopulationMap(currentPopulation)
    let newPopulation = [];
    for (let indexOfCell of populationIterable) {
      if (indexOfCell === undefined) break;
      const neighborhoodState = oneDimensionNeighborhoodStateExtractor(indexOfCell, currentPopulation);
      const reducedState = oneDimensionStateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
      newPopulation.push(this._ruleApplicator(reducedState));
    }
    return newPopulation
  }

  run(currentPopulation) {
    const t0 = performance.now();

    const newPopulation = this.oneDimensionGenerationGenerator(currentPopulation);
    // const newPopulation = currentPopulation.map((state, index) => {
    //   const neighborhoodState = oneDimensionNeighborhoodStateExtractor(index, currentPopulation);
    //   const reducedState = oneDimensionStateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
    //   const newCellState = this._ruleApplicator(reducedState);
    //   return newCellState
    // })

    const t1 = performance.now();

    if (this.generationNumber % 100 === 0) {
        this.generationNumber = 0;
        this.totalTimeSpentGenerating = 0;
        console.log('-------------------rest--------------------')
    }

    const time = t1 - t0;
    this.generationNumber += 1;
    this.totalTimeSpentGenerating += time;
    this.generationRate = this.totalTimeSpentGenerating / this.generationNumber
    console.log('rate', this.generationRate)
    return newPopulation;
  }
}


export { GenerationMaker }
