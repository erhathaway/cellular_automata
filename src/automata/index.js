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

  _computeStateOffCoords(coords, currentPopulation) {
    const neighborhoodState = this._neighborStateExtractor(coords, currentPopulation);
    const reducedState = this._stateReducer({ neighbors: neighborhoodState.neighbors, cell: neighborhoodState.cell });
    const cellState = this._ruleApplicator.run(reducedState);
    return cellState
  }

  dimensionPopulationAdjuster(dimensionPopulation, desiredSize, { isContainerDimension } = { isContainerDimension: false }) {
    const scaleDiff = desiredSize - dimensionPopulation.length
    return dimensionPopulation // TODO placeholder

    if (scaleDiff > 0) {
      const filler = new Array(scaleDiff).fill(isContainerDimension ? [] : 0)
      return [...dimensionPopulation, ...filler]
    } else if (scaleDiff < 0) {
      return dimensionPopulation.slice(0, desiredSize)
    } else {
      return dimensionPopulation
    }
  }

  _run(currentPopulation, desiredPopulationShape, existingCoords = {}) {
    const dimensions = Object.keys(desiredPopulationShape).sort(); // built up in terms of x, y, z etc...
    const dimensionKey = dimensions[0];
    const desiredDimensionPopulationSize = desiredPopulationShape[dimensionKey];
    const actualDimensionPopulation = currentPopulation;


    // if only dimension left in shape, generate states
    if (dimensions.length === 1) {
      const adjustedDimensionPopulation = this.dimensionPopulationAdjuster(actualDimensionPopulation, desiredDimensionPopulationSize);
      return adjustedDimensionPopulation.map((cellState, cellPosition) => {
        const coords = { [dimensionKey]: cellPosition, ...existingCoords };
        return this._computeStateOffCoords(coords, adjustedDimensionPopulation)
      })
    // other dimensions, recursively call this function
    } else {
      const adjustedDimensionPopulation = this.dimensionPopulationAdjuster(actualDimensionPopulation, desiredDimensionPopulationSize, { isContainerDimension: true });
      return adjustedDimensionPopulation.map((arr, arrPosition) => {
        const newShape = { ...desiredPopulationShape };
        delete newShape[dimensionKey]
        const newCoords = { [dimensionKey]: arrPosition, ...existingCoords };
        return this._run(adjustedDimensionPopulation, newShape, newCoords)
      })
    }
  }

  run(currentPopulation) {
    const t0 = performance.now();
    const newPopulation = this._run(currentPopulation, this.populationShape);
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
