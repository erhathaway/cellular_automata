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
  private _history: Uint8Array[] = [];
  private _historyIndex = -1;
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
    this._history = [];
    this._historyIndex = -1;
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
    this._generationHistorySize = size;
  }

  get generationHistorySize(): number {
    return this._generationHistorySize;
  }

  get totalGenerations(): number {
    return this._history.length;
  }

  get currentGenerationIndex(): number {
    return this._historyIndex;
  }

  seedDensity = 0.5;

  getSeedPopulation(): Population {
    this._currentPopulation = PopulationManager.seedPopulationByShape(this._populationShape, this.seedDensity);
    this._history = [this._snapshotPopulation(this._currentPopulation)];
    this._historyIndex = 0;
    return this._currentPopulation;
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
    this._ruleApplicator.rule = { survive: [4, 5], born: [5] };
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

  // Flatten a Population (arbitrarily nested number arrays) into a flat number[]
  private _flattenPopulation(pop: Population): number[] {
    const result: number[] = [];
    const stack: any[] = [pop];
    while (stack.length > 0) {
      const item = stack.pop();
      if (Array.isArray(item)) {
        // Push in reverse so we process in order
        for (let i = item.length - 1; i >= 0; i--) {
          stack.push(item[i]);
        }
      } else {
        result.push(item as number);
      }
    }
    return result;
  }

  // Bitpack an array of 0/1 values into a Uint8Array (8 cells per byte)
  _snapshotPopulation(pop: Population): Uint8Array {
    const flat = this._flattenPopulation(pop);
    const byteLen = Math.ceil(flat.length / 8);
    const bytes = new Uint8Array(byteLen);
    for (let i = 0; i < flat.length; i++) {
      if (flat[i] === 1) {
        bytes[i >> 3] |= 1 << (7 - (i & 7));
      }
    }
    return bytes;
  }

  // Restore a Population from a bitpacked snapshot using the current _populationShape
  _restorePopulation(snapshot: Uint8Array): Population {
    const dims = Object.keys(this._populationShape).sort();

    // Compute total cell count and unpack bits
    let totalCells = 1;
    for (const d of dims) totalCells *= this._populationShape[d];

    const flat: number[] = new Array(totalCells);
    for (let i = 0; i < totalCells; i++) {
      flat[i] = (snapshot[i >> 3] >> (7 - (i & 7))) & 1;
    }

    // Reshape: dims are sorted, outermost first
    if (dims.length === 1) {
      return flat;
    }

    // Build shape sizes array from outermost to innermost
    const sizes = dims.map((d) => this._populationShape[d]);

    // Recursive reshape
    function reshape(data: number[], shapeSizes: number[]): Population {
      if (shapeSizes.length === 1) return data;
      const outerSize = shapeSizes[0];
      const innerTotal = data.length / outerSize;
      const innerSizes = shapeSizes.slice(1);
      const result: Population[] = [];
      for (let i = 0; i < outerSize; i++) {
        result.push(reshape(data.slice(i * innerTotal, (i + 1) * innerTotal), innerSizes));
      }
      return result;
    }

    return reshape(flat, sizes);
  }

  getPopulationAtIndex(index: number): Population | null {
    if (index < 0 || index >= this._history.length) return null;
    return this._restorePopulation(this._history[index]);
  }

  seekTo(index: number) {
    const clamped = Math.max(0, Math.min(index, this._history.length - 1));
    this._historyIndex = clamped;
    this._currentPopulation = this._restorePopulation(this._history[clamped]);
  }

  generateNextPopulationFromCurrent() {
    this._currentPopulation = PopulationManager.generateNextPopulationFromCurrent(
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

    // If we're behind the end of history, advance through existing snapshots
    if (this._historyIndex < this._history.length - 1) {
      this._historyIndex++;
      this._currentPopulation = this._restorePopulation(this._history[this._historyIndex]);
      return this._currentPopulation;
    }

    // Compute new generation
    this.generateNextPopulationFromCurrent();

    // Snapshot and append
    const snapshot = this._snapshotPopulation(this._currentPopulation!);
    this._history.push(snapshot);

    // Trim if over limit
    if (this._history.length > this._generationHistorySize) {
      const excess = this._history.length - this._generationHistorySize;
      this._history.splice(0, excess);
    }

    this._historyIndex = this._history.length - 1;
    return this._currentPopulation!;
  }
}
