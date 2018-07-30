import {
  oneDimension as oneDimensionNeighborhoodStateExtractor,
  twoDimension as twoDimensionNeighborhoodStateExtractor,
  threeDimension as threeDimensionNeighborhoodStateExtractor,
} from './neighborhoodStateExtractor';
import { oneDimension as oneDimensionStateReducer, lifeLike as lifeLikeStateReducer } from './stateReducer';
import { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './ruleApplicator';
import { populationSeed } from './populationSeed';
import PopulationManager from './populationManager';

class AutomataManager {
  constructor() {
    this.populationManager = new PopulationManager();
    this.useLifeLikeGenerator();
    this.useOneDimensionGenerator();
    this.useThreeDimensionGenerator();
    // this.generationRate = 0;
    this.totalTimeSpentGenerating = 0;
    this.generationNumber = 0;
    this.populationShape = {};
    this.populationShapeChanged = false;
  }

  set rule(rule) {
    this._rule = rule;
    this._ruleApplicator.rule = this.rule;
  }

  get rule() {
    return this._rule;
  }

  set populationShape(shape) {
    if ( JSON.stringify(shape) !== JSON.stringify(this.populationShape)) {
      this._populationShape = shape;
      this._populationShapeChanged = true;
    }
  }

  get populationShape() {
    return this._populationShape;
  }

  getSeedPopulation() {
    return PopulationManager.seedPopulationByShape(this.populationShape);
  }

  resizeCurrentPopulation(curentPopulation) {
    return PopulationManager.resizePopulation(curentPopulation, this.populationShape)
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
    this._ruleApplicator.rule = { survive: [5, 6], born: [1] };
  }

  _computeStateOffCoords =(coords, currentPopulation) => {
    const neighborhoodState = this._neighborStateExtractor(coords, currentPopulation);
    const reducedState = this._stateReducer({
      neighbors: neighborhoodState.neighbors,
      cell: neighborhoodState.cell,
    });
    const cellState = this._ruleApplicator.run(reducedState);
    return cellState;
  }

  run(currentPopulation) {
    if (this.populationShapeChanged) {
      const resizedPopulation = this.resizeCurrentPopulation(currentPopulation);
      this.populationShapeChanged = false;
      return PopulationManager.generateNextPopulationFromCurrent(resizedPopulation, resizedPopulation, this._populationShape, this._computeStateOffCoords); // eslint-disable-line max-len
    }

    return PopulationManager.generateNextPopulationFromCurrent(currentPopulation, currentPopulation, this._populationShape, this._computeStateOffCoords); // eslint-disable-line max-len
  }
}


export default AutomataManager;
