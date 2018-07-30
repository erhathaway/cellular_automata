import { oneDimension as oneDimensionNeighborhoodStateExtractor, twoDimension as twoDimensionNeighborhoodStateExtractor } from './neighborhoodStateExtractor';
import { oneDimension as oneDimensionStateReducer, lifeLike as lifeLikeStateReducer } from './stateReducer';
import { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './ruleApplicator';
import { populationSeed } from './populationSeed';

export default class GenerationMaker {
  constructor() {
    this.useLifeLikeGenerator();
    this.useOneDimensionGenerator();
    // this.generationRate = 0;
    this.totalTimeSpentGenerating = 0;
    this.generationNumber = 0;
  }

  set rule(rule) {
    this._rule = rule;
    this._ruleApplicator.rule = this.rule;
  }

  get rule() {
    return this._rule;
  }

  runPopulationSeed(populationShape) {
    return this._populationSeed(populationShape);
  }

  useOneDimensionGenerator() {
    this._generatorType = 'oneDimension';
    this._populationSeed = populationSeed;
    this._neighborStateExtractor = oneDimensionNeighborhoodStateExtractor;
    this._stateReducer = oneDimensionStateReducer;
    this._ruleApplicator = new OneDimensionRuleApplicator();
  }

  useLifeLikeGenerator() {
    this._generatorType = 'twoDimension';
    this._populationSeed = populationSeed;
    this._neighborStateExtractor = twoDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
  }

  _computeStateOffCoords(coords, currentPopulation) {
    const neighborhoodState = this._neighborStateExtractor(coords, currentPopulation);
    const reducedState = this._stateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
    const cellState = this._ruleApplicator.run(reducedState);
    return cellState
  }

  _run(currentPopulation) {
    let newPopulation = [];

    for (let x = 0; x < currentPopulation.length; x++) {
      const column = currentPopulation[x];

      // if 2D
      if (Array.isArray(column)) {
        const rowStates = [];
        for (let y = 0; y < column.length; y++) {
          const coords = { x, y };
          const state = this._computeStateOffCoords(coords, currentPopulation);
          rowStates.push(state)
        }
        newPopulation.push(rowStates)
      // if 1D
      } else {
        const coords = { x }
        const state = this._computeStateOffCoords(coords, currentPopulation);
        newPopulation.push(state)
      }

    }
    return newPopulation
  }

  run(currentPopulation) {
    const t0 = performance.now();
    const newPopulation = this._run(currentPopulation);
    const t1 = performance.now();

    if (this.generationNumber % 100 === 0) {
        this.generationNumber = 0;
        this.totalTimeSpentGenerating = 0;
        // console.log('-------------------reset--------------------')
    }

    const time = t1 - t0;
    this.generationNumber += 1;
    this.totalTimeSpentGenerating += time;
    this.generationRate = this.totalTimeSpentGenerating / this.generationNumber
    // console.log('**generation rate**', this.generationRate)
    // console.log('**generation rate**', time)

    return newPopulation;
  }
}


export { GenerationMaker }
