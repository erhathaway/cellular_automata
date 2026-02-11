import {
  oneDimension as oneDimensionNeighborhoodStateExtractor,
  twoDimension as twoDimensionNeighborhoodStateExtractor,
  threeDimension as threeDimensionNeighborhoodStateExtractor,
} from './neighborhoodStateExtractor';
import {
  oneDimension as oneDimensionStateReducer,
  lifeLike as lifeLikeStateReducer,
} from './stateReducer';
import { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './ruleApplicator';
import type { LifeLikeRule } from './ruleApplicator';
import PopulationManager from './populationManager';
import type { PopulationShape, Population } from './populationSeed';

type GeneratorType = 'oneDimension' | 'twoDimension' | 'threeDimension';

export default class AutomataManager {
  private _rule: any;
  private _currentPopulation: Population | undefined;
  private _populationShape: PopulationShape = {};
  populationShapeChanged = false;
  generationHistory: any[] = [];
  private _generationHistorySize = 20;
  private _generatorType: GeneratorType = 'twoDimension';
  private _neighborStateExtractor: any;
  private _stateReducer: any;
  private _ruleApplicator: OneDimensionRuleApplicator | LifeLikeRuleApplicator;

  constructor() {
    this._ruleApplicator = new LifeLikeRuleApplicator();
    this.useLifeLikeGenerator();
    this._currentPopulation = undefined;
    this._populationShape = {};
    this.populationShapeChanged = false;
    this.generationHistory = [];
    this._generationHistorySize = 20;
  }

  set rule(rule: any) {
    this._rule = rule;
    this._ruleApplicator.rule = rule;
  }

  get rule(): any {
    return this._rule;
  }

  set populationShape(shape: PopulationShape) {
    if (JSON.stringify(shape) !== JSON.stringify(this._populationShape)) {
      this._populationShape = shape;
      this.populationShapeChanged = true;
    }
  }

  get populationShape(): PopulationShape {
    return this._populationShape;
  }

  set generationHistorySize(size: number) {
    this.generationHistory = this.generationHistory.slice(-size);
    this._generationHistorySize = size;
  }

  get generationHistorySize(): number {
    return this._generationHistorySize;
  }

  getSeedPopulation(): Population {
    this.currentPopulation = PopulationManager.seedPopulationByShape(this._populationShape);
    return this.currentPopulation!;
  }

  set currentPopulation(population: Population | undefined) {
    if (population) {
      this.generationHistory = this.generationHistory.slice(-this._generationHistorySize);
      this.generationHistory.push(PopulationManager.compressPopulation(population));
    }
    this._currentPopulation = population;
  }

  get currentPopulation(): Population | undefined {
    return this._currentPopulation;
  }

  resizeCurrentPopulation() {
    this._currentPopulation = PopulationManager.resizePopulation(
      this._currentPopulation!,
      this._populationShape
    );
  }

  useOneDimensionGenerator() {
    this._generatorType = 'oneDimension';
    this._neighborStateExtractor = oneDimensionNeighborhoodStateExtractor;
    this._stateReducer = oneDimensionStateReducer;
    this._ruleApplicator = new OneDimensionRuleApplicator();
  }

  useLifeLikeGenerator() {
    this._generatorType = 'twoDimension';
    this._neighborStateExtractor = twoDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
  }

  useThreeDimensionGenerator() {
    this._generatorType = 'threeDimension';
    this._neighborStateExtractor = threeDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
    this._ruleApplicator.rule = { survive: [5, 6], born: [1] };
  }

  private _computeStateOffCoords = (coords: any, currentPopulation: Population): number => {
    const neighborhoodState = this._neighborStateExtractor(coords, currentPopulation);
    const reducedState = this._stateReducer({
      neighbors: neighborhoodState.neighbors,
      cell: neighborhoodState.cell,
    });
    const cellState = this._ruleApplicator.run(reducedState);
    return cellState;
  };

  generateNextPopulationFromCurrent() {
    this.currentPopulation = PopulationManager.generateNextPopulationFromCurrent(
      this._currentPopulation!,
      this._currentPopulation!,
      this._populationShape,
      this._computeStateOffCoords
    );
  }

  run(): Population {
    if (this.populationShapeChanged) {
      this.resizeCurrentPopulation();
      this.populationShapeChanged = false;
    }
    this.generateNextPopulationFromCurrent();
    return this._currentPopulation!;
  }
}
