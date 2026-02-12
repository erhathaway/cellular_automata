import {
  oneDimension as oneDimensionNeighborhoodStateExtractor,
  twoDimension as twoDimensionNeighborhoodStateExtractor,
  threeDimension as threeDimensionNeighborhoodStateExtractor,
  createCoordinateExtractors,
} from './neighborhoodStateExtractor';
import {
  oneDimension as oneDimensionStateReducer,
  lifeLike as lifeLikeStateReducer,
} from './stateReducer';
import { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './ruleApplicator';
import type { LifeLikeRule } from './ruleApplicator';
import PopulationManager from './populationManager';
import type { PopulationShape, Population } from './populationSeed';
import { getLattice, generateNeighborhood } from './lattice';
import type { LatticeType } from './lattice';

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

  // Fast-path fields (single-shape)
  private _neighborOffsets2D: [number, number][] = [];
  private _neighborOffsets2DByParity: [[number, number][], [number, number][]] | null = null;
  private _neighborOffsets3D: [number, number, number][] = [];
  private _bornLookup: Uint8Array = new Uint8Array(0);
  private _surviveLookup: Uint8Array = new Uint8Array(0);

  // Multi-shape fields
  private _latticeType: LatticeType | undefined;
  private _shapeAt: ((x: number, y: number) => number) | null = null;
  private _shapeOffsets2D: [number, number][][] = [];
  private _shapeBornLookups: Uint8Array[] = [];
  private _shapeSurviveLookups: Uint8Array[] = [];

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

  // Parse a single coordinate part like "x+2", "y-1", "z" into its delta
  private _parseDelta(part: string): number {
    const plusIdx = part.indexOf('+');
    if (plusIdx !== -1) return +part.slice(plusIdx + 1);
    const minusIdx = part.indexOf('-');
    if (minusIdx !== -1) return -parseInt(part.slice(minusIdx + 1), 10);
    return 0;
  }

  // Parse neighbor strings into numeric offset arrays
  private _parseNeighborOffsets(neighborStrings: string[]): void {
    this._neighborOffsets2D = [];
    this._neighborOffsets2DByParity = null;
    this._neighborOffsets3D = [];
    if (neighborStrings.length === 0) return;
    const dims = neighborStrings[0].split('|').length;
    if (dims === 2) {
      this._neighborOffsets2D = neighborStrings.map((s) => {
        const parts = s.split('|');
        return [this._parseDelta(parts[0]), this._parseDelta(parts[1])];
      });
    } else if (dims === 3) {
      this._neighborOffsets3D = neighborStrings.map((s) => {
        const parts = s.split('|');
        return [this._parseDelta(parts[0]), this._parseDelta(parts[1]), this._parseDelta(parts[2])];
      });
    }
  }

  // Build lookup tables from born/survive arrays
  private _buildRuleLookups(rule: LifeLikeRule, neighborCount: number): void {
    const maxN = neighborCount;
    this._bornLookup = new Uint8Array(maxN + 1);
    this._surviveLookup = new Uint8Array(maxN + 1);
    for (const n of rule.born) {
      if (n <= maxN) this._bornLookup[n] = 1;
    }
    for (const n of rule.survive) {
      if (n <= maxN) this._surviveLookup[n] = 1;
    }
  }

  set rule(rule: any) {
    this._rule = rule;
    this._ruleApplicator.rule = rule;

    // Build fast-path lookup tables for life-like rules
    if (rule && Array.isArray(rule.born) && Array.isArray(rule.survive)) {
      const neighborCount =
        this._generatorType === 'threeDimension'
          ? this._neighborOffsets3D.length
          : (this._neighborOffsets2DByParity ? this._neighborOffsets2DByParity[0].length : this._neighborOffsets2D.length);
      if (neighborCount > 0) {
        this._buildRuleLookups(rule, neighborCount);
      }
    } else {
      this._bornLookup = new Uint8Array(0);
      this._surviveLookup = new Uint8Array(0);
    }
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

  set neighbors(neighborStrings: string[]) {
    const extractors = createCoordinateExtractors(neighborStrings);
    const dims = neighborStrings[0]?.split('|').length ?? 2;
    if (dims === 1) {
      this._neighborStateExtractor = (
        cellCoords: { x: number },
        neighborhoodArr: number[]
      ) => ({
        neighbors: extractors.map((fn) => fn(cellCoords, neighborhoodArr)),
        cell: neighborhoodArr[cellCoords.x],
      });
    } else if (dims === 2) {
      this._neighborStateExtractor = (
        cellCoords: { x: number; y: number },
        neighborhoodMatrix: number[][]
      ) => ({
        neighbors: extractors.map((fn) => fn(cellCoords, neighborhoodMatrix)),
        cell: neighborhoodMatrix[cellCoords.x][cellCoords.y],
      });
    } else if (dims === 3) {
      this._neighborStateExtractor = (
        cellCoords: { x: number; y: number; z: number },
        neighborhoodMatrix: number[][][]
      ) => ({
        neighbors: extractors.map((fn) => fn(cellCoords, neighborhoodMatrix)),
        cell: neighborhoodMatrix[cellCoords.x][cellCoords.y][cellCoords.z],
      });
    }

    // Parse offsets for fast path and rebuild rule lookups
    this._parseNeighborOffsets(neighborStrings);
    if (this._rule && Array.isArray(this._rule.born) && Array.isArray(this._rule.survive)) {
      const neighborCount =
        this._generatorType === 'threeDimension'
          ? this._neighborOffsets3D.length
          : this._neighborOffsets2D.length;
      if (neighborCount > 0) {
        this._buildRuleLookups(this._rule, neighborCount);
      }
    }
  }

  seedDensity = 0.5;

  getSeedPopulation(): Population {
    this._currentPopulation = PopulationManager.seedPopulationByShape(this._populationShape, this.seedDensity);
    this._history = [this._snapshotPopulation(this._currentPopulation)];
    this._historyIndex = 0;
    return this._currentPopulation;
  }

  setSeedPopulation(snapshot: Uint8Array): Population {
    this._currentPopulation = this._restorePopulation(snapshot);
    this._history = [snapshot];
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
    this._neighborOffsets2D = [];
    this._neighborOffsets2DByParity = null;
    this._neighborOffsets3D = [];
    this._bornLookup = new Uint8Array(0);
    this._surviveLookup = new Uint8Array(0);
    this._clearMultiShape();
  }

  useLifeLikeGenerator() {
    this._generatorType = 'twoDimension';
    this._neighborStateExtractor = twoDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
    this._neighborOffsets2D = [
      [0, 1], [1, 1], [1, 0], [1, -1],
      [0, -1], [-1, -1], [-1, 0], [-1, 1],
    ];
    this._neighborOffsets2DByParity = null;
    this._neighborOffsets3D = [];
    this._clearMultiShape();
  }

  useThreeDimensionGenerator() {
    this._generatorType = 'threeDimension';
    this._neighborStateExtractor = threeDimensionNeighborhoodStateExtractor;
    this._stateReducer = lifeLikeStateReducer;
    this._ruleApplicator = new LifeLikeRuleApplicator();
    this._ruleApplicator.rule = { survive: [4, 5], born: [5] };
    this._neighborOffsets2D = [];
    this._neighborOffsets2DByParity = null;
    this._neighborOffsets3D = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          this._neighborOffsets3D.push([dx, dy, dz]);
        }
      }
    }
    this._buildRuleLookups({ survive: [4, 5], born: [5] }, this._neighborOffsets3D.length);
    this._clearMultiShape();
  }

  private _clearMultiShape() {
    this._shapeAt = null;
    this._shapeOffsets2D = [];
    this._shapeBornLookups = [];
    this._shapeSurviveLookups = [];
  }

  get latticeType(): LatticeType | undefined {
    return this._latticeType;
  }

  setLattice(latticeType: LatticeType, radius: number = 1) {
    const neighborhood = generateNeighborhood(latticeType, radius);
    const lattice = getLattice(latticeType);
    this._latticeType = latticeType;

    // Set neighbor strings on the generic path (also parses offsets)
    this.neighbors = neighborhood.neighborStrings;

    // Override fast-path offsets with properly typed ones
    if (neighborhood.offsets2D) {
      this._neighborOffsets2D = neighborhood.offsets2D;
      this._neighborOffsets2DByParity = neighborhood.parityOffsets2D ?? null;
      this._neighborOffsets3D = [];
    }
    if (neighborhood.offsets3D) {
      this._neighborOffsets2D = [];
      this._neighborOffsets2DByParity = null;
      this._neighborOffsets3D = neighborhood.offsets3D;
    }

    // Multi-shape setup
    if (neighborhood.shapeCount && neighborhood.shapeCount > 1 && neighborhood.shapeAt && neighborhood.shapeOffsets2D) {
      this._shapeAt = neighborhood.shapeAt;
      this._shapeOffsets2D = neighborhood.shapeOffsets2D;

      // Build per-shape lookups from lattice default rules
      if (lattice.shapes) {
        this._buildShapeLookups(lattice.shapes.map(s => s.defaultRule));
      }
    } else {
      this._clearMultiShape();
    }

    // Rebuild single-shape rule lookups with correct neighbor count
    if (!this._shapeAt && this._rule && Array.isArray(this._rule.born) && Array.isArray(this._rule.survive)) {
      this._buildRuleLookups(this._rule, neighborhood.neighborCount);
    }
  }

  // Build per-shape born/survive lookup tables
  private _buildShapeLookups(rules: { survive: number[]; born: number[] }[]): void {
    this._shapeBornLookups = [];
    this._shapeSurviveLookups = [];
    for (let s = 0; s < rules.length; s++) {
      const maxN = this._shapeOffsets2D[s]?.length ?? 0;
      const born = new Uint8Array(maxN + 1);
      const survive = new Uint8Array(maxN + 1);
      for (const n of rules[s].born) {
        if (n <= maxN) born[n] = 1;
      }
      for (const n of rules[s].survive) {
        if (n <= maxN) survive[n] = 1;
      }
      this._shapeBornLookups.push(born);
      this._shapeSurviveLookups.push(survive);
    }
  }

  setShapeRules(rules: { survive: number[]; born: number[] }[]) {
    if (this._shapeAt && this._shapeOffsets2D.length > 0) {
      this._buildShapeLookups(rules);
    }
  }

  // --- Fast-path generation methods ---

  private _fastGenerateMultiShape2D(): void {
    const pop = this._currentPopulation as number[][];
    const W = pop.length;
    const H = pop[0].length;
    const shapeAt = this._shapeAt!;
    const shapeOffsets = this._shapeOffsets2D;
    const shapeBorn = this._shapeBornLookups;
    const shapeSurvive = this._shapeSurviveLookups;

    const next: number[][] = new Array(W);
    for (let x = 0; x < W; x++) {
      const row = new Array(H);
      const popX = pop[x];
      for (let y = 0; y < H; y++) {
        const s = shapeAt(x, y);
        const offsets = shapeOffsets[s];
        const numOffsets = offsets.length;
        const born = shapeBorn[s];
        const survive = shapeSurvive[s];
        let liveCount = 0;
        for (let n = 0; n < numOffsets; n++) {
          const off = offsets[n];
          liveCount += pop[((x + off[0]) % W + W) % W][((y + off[1]) % H + H) % H];
        }
        row[y] = popX[y] === 1 ? survive[liveCount] : born[liveCount];
      }
      next[x] = row;
    }
    this._currentPopulation = next;
  }

  private _fastGenerate2D(): void {
    const pop = this._currentPopulation as number[][];
    const W = pop.length;
    const H = pop[0].length;
    const parityOffsets = this._neighborOffsets2DByParity;
    const offsets = this._neighborOffsets2D;
    const numOffsets = offsets.length;
    const born = this._bornLookup;
    const survive = this._surviveLookup;

    const next: number[][] = new Array(W);
    for (let x = 0; x < W; x++) {
      const row = new Array(H);
      const popX = pop[x];
      for (let y = 0; y < H; y++) {
        const currentOffsets = parityOffsets ? parityOffsets[y & 1] : offsets;
        const currentNumOffsets = parityOffsets ? currentOffsets.length : numOffsets;
        let liveCount = 0;
        for (let n = 0; n < currentNumOffsets; n++) {
          const off = currentOffsets[n];
          liveCount += pop[((x + off[0]) % W + W) % W][((y + off[1]) % H + H) % H];
        }
        row[y] = popX[y] === 1 ? survive[liveCount] : born[liveCount];
      }
      next[x] = row;
    }
    this._currentPopulation = next;
  }

  private _fastGenerate3D(): void {
    const pop = this._currentPopulation as number[][][];
    const W = pop.length;
    const H = pop[0].length;
    const D = pop[0][0].length;
    const offsets = this._neighborOffsets3D;
    const numOffsets = offsets.length;
    const born = this._bornLookup;
    const survive = this._surviveLookup;

    const next: number[][][] = new Array(W);
    for (let x = 0; x < W; x++) {
      const slice: number[][] = new Array(H);
      const popX = pop[x];
      for (let y = 0; y < H; y++) {
        const row = new Array(D);
        const popXY = popX[y];
        for (let z = 0; z < D; z++) {
          let liveCount = 0;
          for (let n = 0; n < numOffsets; n++) {
            const off = offsets[n];
            liveCount += pop[((x + off[0]) % W + W) % W][((y + off[1]) % H + H) % H][((z + off[2]) % D + D) % D];
          }
          row[z] = popXY[z] === 1 ? survive[liveCount] : born[liveCount];
        }
        slice[y] = row;
      }
      next[x] = slice;
    }
    this._currentPopulation = next;
  }

  // --- Fast-path snapshot methods ---

  private _snapshotPopulation2D(pop: number[][]): Uint8Array {
    const W = pop.length;
    const H = pop[0].length;
    const totalCells = W * H;
    const byteLen = Math.ceil(totalCells / 8);
    const bytes = new Uint8Array(byteLen);
    let i = 0;
    for (let x = 0; x < W; x++) {
      const row = pop[x];
      for (let y = 0; y < H; y++) {
        if (row[y] === 1) {
          bytes[i >> 3] |= 1 << (7 - (i & 7));
        }
        i++;
      }
    }
    return bytes;
  }

  private _snapshotPopulation3D(pop: number[][][]): Uint8Array {
    const W = pop.length;
    const H = pop[0].length;
    const D = pop[0][0].length;
    const totalCells = W * H * D;
    const byteLen = Math.ceil(totalCells / 8);
    const bytes = new Uint8Array(byteLen);
    let i = 0;
    for (let x = 0; x < W; x++) {
      const slice = pop[x];
      for (let y = 0; y < H; y++) {
        const row = slice[y];
        for (let z = 0; z < D; z++) {
          if (row[z] === 1) {
            bytes[i >> 3] |= 1 << (7 - (i & 7));
          }
          i++;
        }
      }
    }
    return bytes;
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

  private _flattenPopulation(pop: Population): number[] {
    const result: number[] = [];
    const stack: any[] = [pop];
    while (stack.length > 0) {
      const item = stack.pop();
      if (Array.isArray(item)) {
        for (let i = item.length - 1; i >= 0; i--) {
          stack.push(item[i]);
        }
      } else {
        result.push(item as number);
      }
    }
    return result;
  }

  _snapshotPopulation(pop: Population): Uint8Array {
    if (this._generatorType === 'twoDimension' && this._neighborOffsets2D.length > 0) {
      return this._snapshotPopulation2D(pop as number[][]);
    }
    if (this._generatorType === 'threeDimension' && this._neighborOffsets3D.length > 0) {
      return this._snapshotPopulation3D(pop as number[][][]);
    }
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

  _restorePopulation(snapshot: Uint8Array): Population {
    const dims = Object.keys(this._populationShape).sort();

    let totalCells = 1;
    for (const d of dims) totalCells *= this._populationShape[d];

    const flat: number[] = new Array(totalCells);
    for (let i = 0; i < totalCells; i++) {
      flat[i] = (snapshot[i >> 3] >> (7 - (i & 7))) & 1;
    }

    if (dims.length === 1) {
      return flat;
    }

    const sizes = dims.map((d) => this._populationShape[d]);

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
    if (this._generatorType === 'twoDimension') {
      if (this._shapeAt && this._shapeBornLookups.length > 0) {
        this._fastGenerateMultiShape2D();
        return;
      }
      if (this._bornLookup.length > 0) {
        this._fastGenerate2D();
        return;
      }
    }
    if (this._generatorType === 'threeDimension' && this._bornLookup.length > 0) {
      this._fastGenerate3D();
      return;
    }
    this._currentPopulation = PopulationManager.generateNextPopulationFromCurrent(
      this._currentPopulation!,
      this._currentPopulation!,
      this._populationShape,
      this._computeStateOffCoords
    );
  }

  private _popcount(snapshot: Uint8Array): number {
    let count = 0;
    for (let i = 0; i < snapshot.length; i++) {
      let b = snapshot[i];
      while (b) {
        b &= b - 1;
        count++;
      }
    }
    return count;
  }

  checkStability(lookback = 20): { stable: boolean; kind: 'exact' | 'quasi' | 'none'; period: number } {
    if (this._history.length < 2) return { stable: false, kind: 'none', period: 0 };

    const current = this._history[this._history.length - 1];
    const searchStart = Math.max(0, this._history.length - 1 - lookback);

    for (let i = this._history.length - 2; i >= searchStart; i--) {
      const past = this._history[i];
      if (current.length === past.length && current.every((b, j) => b === past[j])) {
        return { stable: true, kind: 'exact', period: this._history.length - 1 - i };
      }
    }

    const windowSize = this._history.length - searchStart;
    if (windowSize >= lookback) {
      let min = Infinity;
      let max = -Infinity;
      let sum = 0;
      for (let i = searchStart; i < this._history.length; i++) {
        const pc = this._popcount(this._history[i]);
        if (pc < min) min = pc;
        if (pc > max) max = pc;
        sum += pc;
      }
      const mean = sum / windowSize;
      if (mean === 0 || (max - min) / mean < 0.02) {
        return { stable: true, kind: 'quasi', period: 0 };
      }
    }

    return { stable: false, kind: 'none', period: 0 };
  }

  run(): Population {
    if (this.populationShapeChanged) {
      this.resizeCurrentPopulation();
      this.populationShapeChanged = false;
    }

    if (this._historyIndex < this._history.length - 1) {
      this._historyIndex++;
      this._currentPopulation = this._restorePopulation(this._history[this._historyIndex]);
      return this._currentPopulation;
    }

    this.generateNextPopulationFromCurrent();

    const snapshot = this._snapshotPopulation(this._currentPopulation!);
    this._history.push(snapshot);

    if (this._history.length > this._generationHistorySize) {
      const excess = this._history.length - this._generationHistorySize;
      this._history.splice(0, excess);
    }

    this._historyIndex = this._history.length - 1;
    return this._currentPopulation!;
  }
}
