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

// --- Default shapes by dimension+viewer combo ---
function defaultShape(dim: number, viewer: number): Record<string, number> {
  if (dim === 1) return { x: 200 };
  if (dim === 2 && viewer === 2) return { x: 200, y: 200 };
  if (dim === 2 && viewer === 3) return { x: 70, y: 50 };
  if (dim === 3) return { x: 20, y: 20, z: 35 };
  return { x: 200, y: 200 };
}

// --- Default cell states by dimension+viewer combo ---
function defaultCellStates(dim: number, viewer: number): CellStateEntry[] {
  const white: HSLColor = { h: 360, s: 1, l: 1, a: 1 };
  const black: HSLColor = { h: 0, s: 0, l: 0, a: 1 };
  const blue: HSLColor = { h: 234, s: 0.7, l: 0.4, a: 1 };
  const orange: HSLColor = { h: 39, s: 1, l: 0.5, a: 1 };

  if (dim === 1) return [{ number: 0, color: white }, { number: 1, color: black }];
  if (dim === 2 && viewer === 2) return [{ number: 0, color: white }, { number: 1, color: blue }];
  if (dim === 2 && viewer === 3) return [{ number: 0, color: white }, { number: 1, color: orange }];
  if (dim === 3) return [{ number: 0, color: white }, { number: 1, color: orange }];
  return [{ number: 0, color: white }, { number: 1, color: blue }];
}

function defaultNeighbors(dim: number): string[] {
  if (dim === 1) return [...ONE_D_NEIGHBORS];
  if (dim === 3) return [...THREE_D_NEIGHBORS];
  return [...TWO_D_NEIGHBORS];
}

function defaultRule(dim: number): AutomataRule {
  if (dim === 1) return { type: 'wolfram', rule: 110 };
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
  rule: AutomataRule = $state({ type: 'conway', survive: [2, 3], born: [3] });
  isPlaying = $state(false);
  resetCounter = $state(0);

  // Indexed history for shape and cellStates
  private _shapeHistory: Map<string, Record<string, number>> = new Map();
  private _cellStatesHistory: Map<string, CellStateEntry[]> = new Map();

  constructor() {
    // Save initial state
    this._shapeHistory.set(historyKey(2, 2), { x: 200, y: 200 });
    this._cellStatesHistory.set(historyKey(2, 2), [
      { number: 0, color: { h: 360, s: 1, l: 1, a: 1 } },
      { number: 1, color: { h: 234, s: 0.7, l: 0.4, a: 1 } },
    ]);
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

    // Cascade: update neighbors
    this.neighbors = defaultNeighbors(newDim);

    // Cascade: update rule
    this.rule = defaultRule(newDim);

    // Cascade: update shape + cellStates (may restore from history)
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
  }

  // --- Internal helpers ---
  private _saveToHistory() {
    const key = historyKey(this.dimension, this.viewer);
    this._shapeHistory.set(key, { ...this.populationShape });
    this._cellStatesHistory.set(
      key,
      this.cellStates.map((s) => ({ ...s }))
    );
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
  }
}

export const automataStore = new AutomataStore();
