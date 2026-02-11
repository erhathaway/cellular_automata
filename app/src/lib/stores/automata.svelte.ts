import { generateMooreNeighbors1D, generateMooreNeighbors2D, generateMooreNeighbors3D } from '$lib-core';

// --- HSL Color type ---
export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface CellStateEntry {
  number: number;
  color: HSLColor;
}

// --- Neighbor coordinate strings ---
const ONE_D_NEIGHBORS = ['x-1', 'x+1'];
const TWO_D_NEIGHBORS = [
  'x|y+1', 'x+1|y+1', 'x+1|y', 'x+1|y-1',
  'x|y-1', 'x-1|y-1', 'x-1|y', 'x-1|y+1',
];
const THREE_D_NEIGHBORS = [
  'x|y+1|z', 'x+1|y+1|z', 'x+1|y|z', 'x+1|y-1|z', 'x|y-1|z', 'x-1|y-1|z', 'x-1|y|z', 'x-1|y+1|z',
  'x|y+1|z+1', 'x+1|y+1|z+1', 'x+1|y|z+1', 'x+1|y-1|z+1', 'x|y-1|z+1', 'x-1|y-1|z+1', 'x-1|y|z+1', 'x-1|y+1|z+1', 'x|y|z+1',
  'x|y+1|z-1', 'x+1|y+1|z-1', 'x+1|y|z-1', 'x+1|y-1|z-1', 'x|y-1|z-1', 'x-1|y-1|z-1', 'x-1|y|z-1', 'x-1|y+1|z-1', 'x|y|z-1',
];

// --- Rule types ---
export type WolframRule = { type: 'wolfram'; rule: number };
export type ConwayRule = { type: 'conway'; survive: number[]; born: number[] };
export type AutomataRule = WolframRule | ConwayRule;

export interface ComboSettings {
  populationShape: Record<string, number>;
  rule: AutomataRule;
  cellStates: CellStateEntry[];
  neighborhoodRadius?: number;
}

export const VALID_COMBOS = [[1, 2], [2, 2], [2, 3], [3, 3]] as const;

// --- Default shapes by dimension+viewer combo ---
export function defaultShape(dim: number, viewer: number): Record<string, number> {
  if (dim === 1) return { x: 200 };
  if (dim === 2 && viewer === 2) return { x: 150, y: 150 };
  if (dim === 2 && viewer === 3) return { x: 70, y: 50 };
  if (dim === 3) return { x: 40, y: 40, z: 40 };
  return { x: 150, y: 150 };
}

// --- Default cell states by dimension+viewer combo ---
export function defaultCellStates(dim: number, viewer: number): CellStateEntry[] {
  const white: HSLColor = { h: 360, s: 1, l: 1, a: 1 };
  const black: HSLColor = { h: 0, s: 0, l: 0, a: 1 };
  const blue: HSLColor = { h: 234, s: 0.7, l: 0.55, a: 1 };
  const orange: HSLColor = { h: 39, s: 1, l: 0.5, a: 1 };

  if (dim === 1) return [{ number: 0, color: white }, { number: 1, color: black }];
  if (dim === 2 && viewer === 2) return [{ number: 0, color: white }, { number: 1, color: blue }];
  if (dim === 2 && viewer === 3) return [{ number: 0, color: white }, { number: 1, color: blue }];
  if (dim === 3) return [{ number: 0, color: white }, { number: 1, color: orange }];
  return [{ number: 0, color: white }, { number: 1, color: blue }];
}

function defaultNeighbors(dim: number, radius: number = 1): string[] {
  if (dim === 1) return generateMooreNeighbors1D(radius);
  if (dim === 3) return generateMooreNeighbors3D(radius);
  return generateMooreNeighbors2D(radius);
}

export function defaultRule(dim: number): AutomataRule {
  if (dim === 1) return { type: 'wolfram', rule: 110 };
  if (dim === 3) return { type: 'conway', survive: [4, 5], born: [5] };
  return { type: 'conway', survive: [2, 3], born: [3] };
}

function defaultViewer(dim: number): number {
  if (dim === 1) return 2;
  if (dim === 3) return 3;
  return 2;
}

// --- Indexed history helper ---
function historyKey(dim: number, viewer: number): string {
  return `${dim}-${viewer}`;
}

// --- Main store ---
class AutomataStore {
  // Core reactive state
  dimension = $state(2);
  viewer = $state(2);
  populationShape: Record<string, number> = $state({ x: 200, y: 200 });
  cellStates: CellStateEntry[] = $state([
    { number: 0, color: { h: 360, s: 1, l: 1, a: 1 } },
    { number: 1, color: { h: 234, s: 0.7, l: 0.4, a: 1 } },
  ]);
  neighbors: string[] = $state([...TWO_D_NEIGHBORS]);
  neighborhoodRadius = $state(1);
  rule: AutomataRule = $state({ type: 'conway', survive: [2, 3], born: [3] });
  isPlaying = $state(false);
  resetCounter = $state(0);

  // Generation tracking for scrubber
  generationIndex = $state(0);
  totalGenerations = $state(0);
  historyCapacity = $state(1);
  seekTarget: number | null = $state(null);
  targetGeneration = $state(0);

  // Mining animation state
  isMining = $state(false);
  claimAnimationCounter = $state(0);

  // Stability detection
  stableDetected = $state(false);
  stablePeriod = $state(0);
  stableKind: 'exact' | 'quasi' | 'none' = $state('none');

  // Preview callbacks (set by ViewPlayer, not reactive)
  getPopulationAtIndex: ((index: number) => any) | null = null;
  renderPreviewFrame: ((populations: any[], canvas: HTMLCanvasElement) => void) | null = null;
  getCanvasDataURL: (() => string | null) | null = null;

  // Indexed history for shape, cellStates, rule, and radius
  private _shapeHistory: Map<string, Record<string, number>> = new Map();
  private _cellStatesHistory: Map<string, CellStateEntry[]> = new Map();
  private _ruleHistory: Map<string, AutomataRule> = new Map();
  private _radiusHistory: Map<string, number> = new Map();

  constructor() {
    // Save initial state
    const key = historyKey(2, 2);
    this._shapeHistory.set(key, { x: 200, y: 200 });
    this._cellStatesHistory.set(key, [
      { number: 0, color: { h: 360, s: 1, l: 1, a: 1 } },
      { number: 1, color: { h: 234, s: 0.7, l: 0.4, a: 1 } },
    ]);
    this._ruleHistory.set(key, { type: 'conway', survive: [2, 3], born: [3] });
  }

  // --- Derived values ---
  get shapeKeys(): string[] {
    return Object.keys(this.populationShape);
  }

  get cellStatesForViewer(): { number: number; color: HSLColor }[] {
    return this.cellStates;
  }

  hslString(color: HSLColor): string {
    return `hsl(${Math.floor(color.h)}, ${Math.floor(color.s * 100)}%, ${Math.floor(color.l * 100)}%)`;
  }

  // --- Actions ---
  setDimension(newDim: 1 | 2 | 3) {
    if (newDim === this.dimension) return;

    // Save current state to history
    this._saveToHistory();

    this.dimension = newDim;

    // Cascade: update viewer
    this.viewer = defaultViewer(newDim);

    // Cascade: update shape + cellStates + rule + radius (may restore from history)
    this._restoreOrDefault();
  }

  setViewer(newViewer: 2 | 3) {
    if (newViewer === this.viewer) return;

    // Save current state to history
    this._saveToHistory();

    this.viewer = newViewer;

    // Cascade: update shape + cellStates
    this._restoreOrDefault();
  }

  setPopulationShapeDimension(key: string, value: number) {
    this.populationShape = { ...this.populationShape, [key]: value };
    this._shapeHistory.set(historyKey(this.dimension, this.viewer), { ...this.populationShape });
  }

  setCellStateColor(stateNumber: number, color: HSLColor) {
    this.cellStates = this.cellStates.map((s) =>
      s.number === stateNumber ? { ...s, color } : s
    );
    this._cellStatesHistory.set(
      historyKey(this.dimension, this.viewer),
      this.cellStates.map((s) => ({ ...s }))
    );
  }

  setRule(newRule: AutomataRule) {
    this.rule = newRule;
    this._ruleHistory.set(historyKey(this.dimension, this.viewer), { ...newRule });
  }

  setNeighborhoodRadius(r: number) {
    const clamped = Math.max(1, Math.min(10, r));
    if (clamped === this.neighborhoodRadius) return;
    this.neighborhoodRadius = clamped;
    this.neighbors = defaultNeighbors(this.dimension, clamped);
    this._radiusHistory.set(historyKey(this.dimension, this.viewer), clamped);

    // 1D: Wolfram rules only work at radius 1, switch to life-like for larger
    if (this.dimension === 1 && this.rule.type === 'wolfram' && clamped > 1) {
      this.setRule({ type: 'conway', survive: [2, 3], born: [3] });
    }

    this.reset();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  reset() {
    this.resetCounter++;
    this.generationIndex = 0;
    this.totalGenerations = 0;
    this.seekTarget = null;
    this.stableDetected = false;
    this.stablePeriod = 0;
    this.stableKind = 'none';
  }

  randomizeRule() {
    // On 1D/2D-in-2D, randomly pick between the two; on 2D-in-3D or 3D, stay put
    if (this.viewer === 2 && this.dimension <= 2) {
      const newDim = Math.random() < 0.5 ? 1 : 2;
      if (newDim !== this.dimension) {
        this.setDimension(newDim as 1 | 2);
      }
    }

    // Randomize radius (weighted toward lower values: 1-3 common, 4-5 rare)
    const radiusWeights = [1, 1, 1, 2, 2, 3, 3, 4, 5];
    const newRadius = radiusWeights[Math.floor(Math.random() * radiusWeights.length)];
    this.setNeighborhoodRadius(newRadius);

    if (this.dimension === 1 && this.neighborhoodRadius === 1) {
      // Wolfram rule for 1D radius 1
      this.setRule({ type: 'wolfram', rule: Math.floor(Math.random() * 256) });
    } else {
      const maxNeighbors = this.neighbors.length;
      const pick = () => {
        const arr: number[] = [];
        for (let i = 0; i <= maxNeighbors; i++) {
          if (Math.random() < 0.25) arr.push(i);
        }
        return arr.length > 0 ? arr : [Math.floor(Math.random() * (maxNeighbors + 1))];
      };
      const born = pick();
      const survive = pick();
      this.setRule({ type: 'conway', survive, born });

      // Reduce radius to minimum needed for the rule's max neighbor count
      const maxUsed = Math.max(...born, ...survive);
      const minRadius = this._minRadiusForNeighborCount(this.dimension, maxUsed);
      if (minRadius < this.neighborhoodRadius) {
        this.setNeighborhoodRadius(minRadius);
      }
    }

    // Randomize cell colors for 2D viewers
    if (this.dimension === 2) {
      const h1 = Math.floor(Math.random() * 360);
      const h0 = (h1 + 30 + Math.floor(Math.random() * 60)) % 360;
      this.setCellStateColor(0, { h: h0, s: 0.3 + Math.random() * 0.4, l: 0.85 + Math.random() * 0.1, a: 1 });
      this.setCellStateColor(1, { h: h1, s: 0.7 + Math.random() * 0.3, l: 0.25 + Math.random() * 0.25, a: 1 });
    }

    this.reset();
  }

  setStable(kind: 'exact' | 'quasi', period: number) {
    this.stableDetected = true;
    this.stableKind = kind;
    this.stablePeriod = period;
  }

  dismissStable() {
    this.stableDetected = false;
    this.stablePeriod = 0;
    this.stableKind = 'none';
  }

  updateGenerationInfo(index: number, total: number, capacity?: number) {
    this.generationIndex = index;
    this.totalGenerations = total;
    if (capacity !== undefined) this.historyCapacity = capacity;
  }

  seekTo(index: number) {
    this.seekTarget = index;
  }

  clearSeekTarget() {
    this.seekTarget = null;
  }

  // --- Hydration API ---
  getAllComboSettings(): Record<string, ComboSettings> {
    this._saveToHistory();
    const result: Record<string, ComboSettings> = {};
    for (const [dim, viewer] of VALID_COMBOS) {
      const key = historyKey(dim, viewer);
      result[key] = {
        populationShape: this._shapeHistory.get(key) ?? defaultShape(dim, viewer),
        rule: this._ruleHistory.get(key) ?? defaultRule(dim),
        cellStates: this._cellStatesHistory.get(key) ?? defaultCellStates(dim, viewer),
        neighborhoodRadius: this._radiusHistory.get(key) ?? 1,
      };
    }
    return result;
  }

  hydrateCombo(dim: number, viewer: number, settings: Partial<ComboSettings>) {
    const key = historyKey(dim, viewer);
    if (settings.populationShape) {
      this._shapeHistory.set(key, { ...settings.populationShape });
    }
    if (settings.rule) {
      this._ruleHistory.set(key, { ...settings.rule });
    }
    if (settings.cellStates) {
      this._cellStatesHistory.set(key, settings.cellStates.map((s) => ({ ...s })));
    }
    if (settings.neighborhoodRadius !== undefined) {
      this._radiusHistory.set(key, settings.neighborhoodRadius);
    }
  }

  hydrateActive(dim: number, viewer: number) {
    const key = historyKey(dim, viewer);
    this.dimension = dim;
    this.viewer = viewer;
    this.neighborhoodRadius = this._radiusHistory.get(key) ?? 1;
    this.neighbors = defaultNeighbors(dim, this.neighborhoodRadius);
    this.populationShape = this._shapeHistory.get(key)
      ? { ...this._shapeHistory.get(key)! }
      : defaultShape(dim, viewer);
    this.rule = this._ruleHistory.get(key)
      ? { ...this._ruleHistory.get(key)! }
      : defaultRule(dim);
    this.cellStates = this._cellStatesHistory.get(key)
      ? this._cellStatesHistory.get(key)!.map((s) => ({ ...s }))
      : defaultCellStates(dim, viewer);
  }

  // --- Export for save ---
  exportForSave() {
    const rule = this.rule;
    const ruleType = rule.type;
    let ruleDefinition: string;
    if (rule.type === 'wolfram') {
      ruleDefinition = `W${rule.rule}`;
    } else {
      ruleDefinition = `B${rule.born.join('')}S${rule.survive.join('')}`;
    }

    let stability: 'evolving' | 'quasi_stable' | 'fixed' = 'evolving';
    if (this.stableKind === 'exact') stability = 'fixed';
    else if (this.stableKind === 'quasi') stability = 'quasi_stable';

    return {
      dimension: this.dimension,
      viewer: this.viewer,
      ruleType,
      ruleDefinition,
      populationShape: JSON.stringify(this.populationShape),
      cellStates: JSON.stringify(this.cellStates),
      neighborhoodRadius: this.neighborhoodRadius,
      generationIndex: this.generationIndex,
      stability,
      stablePeriod: this.stablePeriod || null
    };
  }

  // --- Internal helpers ---
  private _saveToHistory() {
    const key = historyKey(this.dimension, this.viewer);
    this._shapeHistory.set(key, { ...this.populationShape });
    this._cellStatesHistory.set(
      key,
      this.cellStates.map((s) => ({ ...s }))
    );
    this._ruleHistory.set(key, { ...this.rule });
    this._radiusHistory.set(key, this.neighborhoodRadius);
  }

  private _minRadiusForNeighborCount(dim: number, count: number): number {
    for (let r = 1; r <= 10; r++) {
      let n: number;
      if (dim === 1) n = 2 * r;
      else if (dim === 3) n = (2 * r + 1) ** 3 - 1;
      else n = (2 * r + 1) ** 2 - 1;
      if (n >= count) return r;
    }
    return 10;
  }

  private _restoreOrDefault() {
    const key = historyKey(this.dimension, this.viewer);

    const savedShape = this._shapeHistory.get(key);
    this.populationShape = savedShape
      ? { ...savedShape }
      : defaultShape(this.dimension, this.viewer);

    const savedStates = this._cellStatesHistory.get(key);
    this.cellStates = savedStates
      ? savedStates.map((s) => ({ ...s }))
      : defaultCellStates(this.dimension, this.viewer);

    const savedRule = this._ruleHistory.get(key);
    this.rule = savedRule
      ? { ...savedRule }
      : defaultRule(this.dimension);

    // Restore radius
    this.neighborhoodRadius = this._radiusHistory.get(key) ?? 1;
    this.neighbors = defaultNeighbors(this.dimension, this.neighborhoodRadius);
  }
}

export const automataStore = new AutomataStore();
