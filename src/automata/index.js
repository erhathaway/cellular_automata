import {
  oneDimension as oneDimensionNeighborhoodStateExtractor,
  twoDimension as twoDimensionNeighborhoodStateExtractor,
  threeDimension as threeDimensionNeighborhoodStateExtractor
} from './neighborhoodStateExtractor';
import { oneDimension as oneDimensionStateReducer, lifeLike as lifeLikeStateReducer } from './stateReducer';
import { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './ruleApplicator';
import { populationSeed } from './populationSeed';

export default class GenerationMaker {
  constructor() {
    this.useLifeLikeGenerator();
    this.useOneDimensionGenerator();
    this.useThreeDimensionGenerator();
    // this.generationRate = 0;
    this.totalTimeSpentGenerating = 0;
    this.generationNumber = 0;
    this.populationShape = {};
  }

  set rule(rule) {
    this._rule = rule;
    this._ruleApplicator.rule = this.rule;
  }

  get rule() {
    return this._rule;
  }

  runPopulationSeed(populationShape) {
    this.populationShape = populationShape;
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

  useThreeDimensionGenerator() {
    this._generatorType = 'threeDimension';
    this._populationSeed = populationSeed;
    this._neighborStateExtractor = threeDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
    this._ruleApplicator.rule = { survive: [5,6], born: [1] };
  }

  _computeStateOffCoords(coords, currentPopulation) {
    const neighborhoodState = this._neighborStateExtractor(coords, currentPopulation);
    const reducedState = this._stateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
    const cellState = this._ruleApplicator.run(reducedState);
    return cellState
  }

  // resizes a population along one dimension
  dimensionPopulationAdjuster(dimensionPopulation, desiredSize, { isContainerDimension, resize, sizeDiff } = { isContainerDimension: false }) {
    switch(resize) {
      case 'GROW':
        const filler = new Array(sizeDiff).fill(isContainerDimension ? [] : 0)
        return [...dimensionPopulation, ...filler]
      case 'SHRINK':
        return dimensionPopulation.slice(0, desiredSize)
      default:
        return dimensionPopulation
    }
  }

  // resizes a multidimensional population
  populationAdjuster(currentPopulation, desiredPopulationShape) {
    // figure out which dimension (x, y, z, etc...) of the population this is based on the desired populationShape
    const dimensions = Object.keys(desiredPopulationShape).sort(); // built up in terms of x, y, z etc...
    const dimensionKey = dimensions[0];
    const desiredDimensionPopulationSize = desiredPopulationShape[dimensionKey];

    // figure out how to resize this dimension of the population
    const sizeDiff = desiredDimensionPopulationSize - currentPopulation.length;
    let resize;
    if (sizeDiff === 0) {
      resize = 'NONE';
    } else {
      resize = sizeDiff > 0 ? 'GROW' : 'SHRINK';
    }
    // if only dimension left in shape, generate states
    if (dimensions.length === 1) {
      // resize population along this dimension
      return this.dimensionPopulationAdjuster(currentPopulation, desiredDimensionPopulationSize, { sizeDiff, resize });
    // other dimensions, recursively call this function
    } else {
      // resize population along this dimension
      const adjustedDimensionPopulation = this.dimensionPopulationAdjuster(currentPopulation, desiredDimensionPopulationSize, { isContainerDimension: true, sizeDiff, resize });
      // remove the current dimension
      const newShape = { ...desiredPopulationShape };
      delete newShape[dimensionKey]
      // for the next dimension, recursively call this function
      return adjustedDimensionPopulation.map((arr, arrPosition) => {
        return this.populationAdjuster(arr, newShape)
      })
    }
  }

  _run(currentPopulation, fullPopulation, populationShape, existingCoords = {}) {
    const dimensions = Object.keys(populationShape).sort(); // built up in terms of x, y, z etc...
    const dimensionKey = dimensions[0];

    // if only dimension left in shape, generate states
    if (dimensions.length === 1) {
      return currentPopulation.map((cellState, cellPosition) => {
        const coords = { [dimensionKey]: cellPosition, ...existingCoords };
        return this._computeStateOffCoords(coords, fullPopulation)
      })
    // other dimensions, recursively call this function
    } else {
      const newShape = { ...populationShape };
      delete newShape[dimensionKey]
      return currentPopulation.map((arr, arrPosition) => {
        const newCoords = { [dimensionKey]: arrPosition, ...existingCoords };
        return this._run(arr, fullPopulation, newShape, newCoords)
      })
    }
  }

  run(currentPopulation) {
    const t0 = performance.now();
    // this.populationAdjuster(currentPopulation, this.populationShape)
    const newPopulation = this._run(currentPopulation, currentPopulation, this.populationShape);

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
