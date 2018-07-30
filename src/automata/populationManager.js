import { UndefinedRequiredClassAttribute } from './errors';

/* coordinate system
┌─────────────────────────────┐
│ ┌─────┐                     │
│ │┌───┐│                     │
│ ││ z ││                     │
│ │└───┘│                     │
│ │     │                     │
│ │  y  │             x       │
│ └─────┘                     │
└─────────────────────────────┘
*/

class PopulationManager {
  static newState() { return Math.round(Math.random()); }

  static seedPopulationByShape(shape) {
    // built up in terms of x, y, z etc...
    const dimensions = Object.keys(shape).sort();
    const firstDimension = dimensions[0];
    const dimensionPopulation = shape[firstDimension];

    // if only dimension left in populationShape, generate states
    if (dimensions.length === 1) {
      return [...new Array(dimensionPopulation)].map(PopulationManager.newState);
    }
    // if more dimensions left, map over those dimensions first
    const newShape = { ...shape };
    delete newShape[firstDimension];
    return [...new Array(dimensionPopulation)]
      .map(() => PopulationManager.seedPopulationByShape(newShape));
  }

  constructor() {
    this._populationShape = undefined; // format { x: INT } | { x: INT, y: INT } | { x: INT, y: INT, z: INT }
    this._recordedGenerations = [];
    this._generationsToRecord = undefined;
    // this._recordedGenerationMax = undefined;
    // this._recordedGenerationMin = undefined;
    // this._currentGeneration = undefined;
    this._runDirection = 'FORWARD'; // 'FORWARD' | 'BACKWARD'
    this.getStateForCellFn = undefined;
  }

  reset() {
    this._populationShape = undefined;
    this._recordedGenerations = [];
  }

  set populationShape(shape) {
    this._populationShape = shape;
  }

  get populationShape() { return this._populationShape; }

  /* SEEDING */
  seedFirstGeneration() {
    if (!this.populationShape) throw new UndefinedRequiredClassAttribute('population shape is not defined');

    return PopulationManager.seedPopulationByShape(this.populationShape);
  }


  /* POPULATION GENERATION */
  _nextGeneration() {

  }

  nextGeneration() {
    const previousGens = this._recordedGenerations.slice(-this._generationsToRecord)
  }
}

export default PopulationManager;
