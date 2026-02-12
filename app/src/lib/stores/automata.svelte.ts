import { generateMooreNeighbors1D, getLattice, generateNeighborhood, latticesForDimension, defaultLattice, isValidLattice } from '$lib-core';
import type { LatticeType } from '$lib-core';

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

const LIVING_BLACK: HSLColor = { h: 0, s: 0, l: 0, a: 1 };

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
  lattice?: LatticeType;
  shapeRules?: { survive: number[]; born: number[] }[];
}

export type MiningDifficulty = 'easy' | 'medium' | 'hard';

export const VALID_COMBOS = [[1, 2], [2, 2], [2, 3], [3, 3]] as const;

// --- Default shapes by dimension+viewer combo ---
export function defaultShape(dim: number, viewer: number): Record<string, number> {
  if (dim === 1) return { x: 200 };
  if (dim === 2 && viewer === 2) return { x: 200, y: 100 };
  if (dim === 2 && viewer === 3) return { x: 70, y: 50 };
  if (dim === 3) return { x: 40, y: 40, z: 40 };
  return { x: 150, y: 150 };
}

// --- Default cell states by dimension+viewer combo ---
export function defaultCellStates(dim: number, viewer: number): CellStateEntry[] {
  const white: HSLColor = { h: 360, s: 1, l: 1, a: 1 };
  if (dim === 1) return [{ number: 0, color: white }, { number: 1, color: { ...LIVING_BLACK } }];
  if (dim === 2 && viewer === 2) return [{ number: 0, color: white }, { number: 1, color: { ...LIVING_BLACK } }];
  if (dim === 2 && viewer === 3) return [{ number: 0, color: white }, { number: 1, color: { ...LIVING_BLACK } }];
  if (dim === 3) return [{ number: 0, color: white }, { number: 1, color: { ...LIVING_BLACK } }];
  return [{ number: 0, color: white }, { number: 1, color: { ...LIVING_BLACK } }];
}

function defaultNeighbors(dim: number, radius: number = 1, lattice?: LatticeType): string[] {
  if (dim === 1) return generateMooreNeighbors1D(radius);
  const lat = lattice ?? defaultLattice(dim);
  return generateNeighborhood(lat, radius).neighborStrings;
}

export function defaultRule(dim: number, lattice?: LatticeType): AutomataRule {
  if (dim === 1) return { type: 'wolfram', rule: 110 };
  const lat = lattice ?? defaultLattice(dim);
  const config = getLattice(lat);
  return { type: 'conway', survive: [...config.defaultRule.survive], born: [...config.defaultRule.born] };
}

function defaultViewer(dim: number): number {
  if (dim === 1) return 2;
  if (dim === 3) return 3;
  return 2;
}

// --- Indexed history helper ---
function historyKey(dim: number, viewer: number, lattice?: LatticeType): string {
  if (lattice && lattice !== defaultLattice(dim)) {
    return `${dim}-${viewer}-${lattice}`;
  }
  return `${dim}-${viewer}`;
}

// --- Main store ---
class AutomataStore {
  // Core reactive state
  dimension = $state(2);
  viewer = $state(2);
  lattice: LatticeType = $state('square');
  populationShape: Record<string, number> = $state({ x: 200, y: 100 });
  cellStates: CellStateEntry[] = $state([
    { number: 0, color: { h: 360, s: 1, l: 1, a: 1 } },
    { number: 1, color: { ...LIVING_BLACK } },
  ]);
  neighbors: string[] = $state([...TWO_D_NEIGHBORS]);
  allNeighborsForRadius: string[] = $state([...TWO_D_NEIGHBORS]);
  neighborEnabled: boolean[] = $state(TWO_D_NEIGHBORS.map(() => true));
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
  miningDifficulty: MiningDifficulty = $state('medium');
  miningLattice: LatticeType | 'random' = $state('random');
  claimAnimationCounter = $state(0);
  claimGemOrigin: { x: number; y: number } | null = $state(null);

  // Stability detection
  stableDetected = $state(false);
  stablePeriod = $state(0);
  stableKind: 'exact' | 'quasi' | 'none' = $state('none');

  // Emergence intervention state
  interventionTaken = $state(false);
  interventionTitle = $state('');
  interventionReason = $state('');
  interventionUpdateRateMs: number | null = $state(null);
  allAutomataDied = $state(false);

  // Per-shape rules for multi-shape lattices (null = single-shape)
  shapeRules: { survive: number[]; born: number[] }[] | null = $state(null);

  // Persistence hydration flag — true once PersistenceManager has applied URL/localStorage state
  hydrated = $state(false);

  // Seed population state
  savedSeed: Uint8Array | null = $state(null);
  useSavedSeed: boolean = $state(true);

  // Preview callbacks (set by ViewPlayer, not reactive)
  getPopulationAtIndex: ((index: number) => any) | null = null;
  renderPreviewFrame: ((populations: any[], canvas: HTMLCanvasElement) => void) | null = null;
  getCanvasDataURL: (() => string | null) | null = null;
  captureThumbnail: (() => string | null) | null = null;
  getSeedSnapshot: (() => Uint8Array | null) | null = null;
  getCurrentPopulationSnapshot: (() => Uint8Array | null) | null = null;

  // Indexed history for shape, cellStates, rule, radius, and lattice
  private _shapeHistory: Map<string, Record<string, number>> = new Map();
  private _cellStatesHistory: Map<string, CellStateEntry[]> = new Map();
  private _ruleHistory: Map<string, AutomataRule> = new Map();
  private _radiusHistory: Map<string, number> = new Map();
  private _latticeHistory: Map<string, LatticeType> = new Map();
  private _shapeRulesHistory: Map<string, { survive: number[]; born: number[] }[]> = new Map();
  private _recentLivingCounts: number[] = [];
  private _recentDeadCounts: number[] = [];
  private _noLivingStreak = 0;

  constructor() {
    // Save initial state
    const key = historyKey(2, 2);
    this._shapeHistory.set(key, { x: 200, y: 200 });
    this._cellStatesHistory.set(key, [
      { number: 0, color: { h: 360, s: 1, l: 1, a: 1 } },
      { number: 1, color: { ...LIVING_BLACK } },
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

  private _enforceLivingBlack(states: CellStateEntry[]): CellStateEntry[] {
    return states.map((s) => (
      s.number === 1
        ? { ...s, color: { ...LIVING_BLACK } }
        : { ...s }
    ));
  }

  // --- Actions ---
  setDimension(newDim: 1 | 2 | 3) {
    if (newDim === this.dimension) return;

    // Save current state to history
    this._saveToHistory();

    this.dimension = newDim;
    this.lattice = defaultLattice(newDim);

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

  setLattice(newLattice: LatticeType) {
    if (newLattice === this.lattice) return;

    // Save current state to history
    this._saveToHistory();

    this.lattice = newLattice;

    // Update neighbors and rule from lattice config
    const neighborhood = generateNeighborhood(newLattice, 1);
    const config = getLattice(newLattice);
    this._setFullNeighbors(neighborhood.neighborStrings);
    this.neighborhoodRadius = 1;
    this.rule = { type: 'conway', survive: [...config.defaultRule.survive], born: [...config.defaultRule.born] };

    // Set per-shape rules if multi-shape lattice
    if (config.shapes) {
      this.shapeRules = config.shapes.map(s => ({
        survive: [...s.defaultRule.survive],
        born: [...s.defaultRule.born],
      }));
    } else {
      this.shapeRules = null;
    }

    // Save to lattice history
    const key = historyKey(this.dimension, this.viewer, this.lattice);
    this._latticeHistory.set(`${this.dimension}-${this.viewer}`, newLattice);
    this._ruleHistory.set(key, { ...this.rule });
    this._radiusHistory.set(key, 1);
    if (this.shapeRules) {
      this._shapeRulesHistory.set(key, this.shapeRules.map(r => ({ ...r })));
    }

    this.reset();
  }

  setPopulationShapeDimension(key: string, value: number) {
    this.populationShape = { ...this.populationShape, [key]: value };
    this._shapeHistory.set(historyKey(this.dimension, this.viewer), { ...this.populationShape });
  }

  setCellStateColor(stateNumber: number, color: HSLColor) {
    const nextColor = stateNumber === 1 ? { ...LIVING_BLACK } : color;
    this.cellStates = this._enforceLivingBlack(
      this.cellStates.map((s) =>
        s.number === stateNumber ? { ...s, color: nextColor } : s
      )
    );
    this._cellStatesHistory.set(
      historyKey(this.dimension, this.viewer),
      this.cellStates.map((s) => ({ ...s }))
    );
  }

  setRule(newRule: AutomataRule) {
    this.rule = newRule;
    this._ruleHistory.set(historyKey(this.dimension, this.viewer, this.lattice), { ...newRule });
  }

  setShapeRule(shapeIndex: number, rule: { survive: number[]; born: number[] }) {
    if (!this.shapeRules) return;
    this.shapeRules = this.shapeRules.map((r, i) => i === shapeIndex ? { ...rule } : r);
    // Keep primary rule in sync with first shape
    if (shapeIndex === 0) {
      this.rule = { type: 'conway', survive: [...rule.survive], born: [...rule.born] };
    }
    const key = historyKey(this.dimension, this.viewer, this.lattice);
    this._shapeRulesHistory.set(key, this.shapeRules.map(r => ({ ...r })));
    this._ruleHistory.set(key, { ...this.rule });
  }

  setNeighborhoodRadius(r: number) {
    const clamped = Math.max(1, Math.min(10, r));
    if (clamped === this.neighborhoodRadius) return;
    this.neighborhoodRadius = clamped;
    this._setFullNeighbors(defaultNeighbors(this.dimension, clamped, this.lattice));
    this._radiusHistory.set(historyKey(this.dimension, this.viewer, this.lattice), clamped);

    // 1D: Wolfram rules only work at radius 1, switch to life-like for larger
    if (this.dimension === 1 && this.rule.type === 'wolfram' && clamped > 1) {
      this.setRule({ type: 'conway', survive: [2, 3], born: [3] });
    }

    this.reset();
  }

  toggleNeighbor(index: number) {
    if (index < 0 || index >= this.neighborEnabled.length) return;
    this.neighborEnabled = this.neighborEnabled.map((v, i) => i === index ? !v : v);
    this.neighbors = this.allNeighborsForRadius.filter((_, i) => this.neighborEnabled[i]);
  }

  setAllNeighborsEnabled(enabled: boolean) {
    this.neighborEnabled = this.allNeighborsForRadius.map(() => enabled);
    this.neighbors = enabled ? [...this.allNeighborsForRadius] : [];
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
    this.clearIntervention();
  }

  randomizeRule() {
    this.savedSeed = null;
    this.useSavedSeed = true;

    if (this.miningLattice !== 'random') {
      // Force dimension to match the selected lattice
      const latticeDim = getLattice(this.miningLattice).dimension as 1 | 2 | 3;
      if (latticeDim !== this.dimension) {
        this.setDimension(latticeDim as 1 | 2 | 3);
      }
      if (this.miningLattice !== this.lattice) {
        this.setLattice(this.miningLattice);
      }
    } else {
      // On 1D/2D-in-2D, randomly pick between the two; on 2D-in-3D or 3D, stay put
      if (this.viewer === 2 && this.dimension <= 2) {
        const newDim = Math.random() < 0.5 ? 1 : 2;
        if (newDim !== this.dimension) {
          this.setDimension(newDim as 1 | 2);
        }
      }

      // Randomize lattice for 2D/3D dimensions
      if (this.dimension >= 2) {
        const available = latticesForDimension(this.dimension as 2 | 3);
        const randomLattice = available[Math.floor(Math.random() * available.length)];
        if (randomLattice.type !== this.lattice) {
          this.setLattice(randomLattice.type);
        }
      }
    }

    // Randomize radius from selected mining difficulty band
    const radiusByDifficulty: Record<MiningDifficulty, number[]> = {
      easy: [1],
      medium: [2, 3],
      hard: [4, 5, 6],
    };
    const radiusPool = radiusByDifficulty[this.miningDifficulty];
    const newRadius = radiusPool[Math.floor(Math.random() * radiusPool.length)];
    this.setNeighborhoodRadius(newRadius);

    if (this.dimension === 1 && this.neighborhoodRadius === 1) {
      // Wolfram rule for 1D radius 1
      this.setRule({ type: 'wolfram', rule: Math.floor(Math.random() * 256) });
    } else {
      const latticeConfig = getLattice(this.lattice);

      if (latticeConfig.shapes && this.shapeRules) {
        // Multi-shape: randomize each shape's rule independently
        const newShapeRules = latticeConfig.shapes.map(shape => {
          const maxN = shape.neighborCount;
          const pick = () => {
            const arr: number[] = [];
            for (let i = 0; i <= maxN; i++) {
              if (Math.random() < 0.25) arr.push(i);
            }
            return arr.length > 0 ? arr : [Math.floor(Math.random() * (maxN + 1))];
          };
          return { survive: pick(), born: pick() };
        });
        this.shapeRules = newShapeRules;
        this.rule = { type: 'conway', survive: [...newShapeRules[0].survive], born: [...newShapeRules[0].born] };
        const key = historyKey(this.dimension, this.viewer, this.lattice);
        this._shapeRulesHistory.set(key, newShapeRules.map(r => ({ ...r })));
        this._ruleHistory.set(key, { ...this.rule });
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

      }
    }

    // Randomize cell colors for 2D viewers
    if (this.dimension === 2) {
      const h1 = Math.floor(Math.random() * 360);
      const h0 = (h1 + 30 + Math.floor(Math.random() * 60)) % 360;
      this.setCellStateColor(0, { h: h0, s: 0.3 + Math.random() * 0.4, l: 0.85 + Math.random() * 0.1, a: 1 });
      this.setCellStateColor(1, { ...LIVING_BLACK });
    }

    this.reset();
  }

  setMiningDifficulty(difficulty: MiningDifficulty) {
    this.miningDifficulty = difficulty;
  }

  setMiningLattice(lattice: LatticeType | 'random') {
    this.miningLattice = lattice;
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

  clearIntervention() {
    this.interventionTaken = false;
    this.interventionTitle = '';
    this.interventionReason = '';
    this.interventionUpdateRateMs = null;
    this.allAutomataDied = false;
    this._recentLivingCounts = [];
    this._recentDeadCounts = [];
    this._noLivingStreak = 0;
  }

  observePopulationForIntervention(population: any) {
    // Flatten arbitrary dimension population into living/dead counts.
    const stack: any[] = [population];
    let living = 0;
    let total = 0;
    while (stack.length > 0) {
      const node = stack.pop();
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) stack.push(node[i]);
      } else {
        total++;
        if (node === 1) living++;
      }
    }
    const dead = total - living;

    if (living === 0) {
      this._noLivingStreak += 1;
      if (this._noLivingStreak >= 5) {
        this.allAutomataDied = true;
      }
    } else {
      this._noLivingStreak = 0;
      this.allAutomataDied = false;
    }

    const WINDOW = 30;
    this._recentLivingCounts.push(living);
    this._recentDeadCounts.push(dead);
    if (this._recentLivingCounts.length > WINDOW) this._recentLivingCounts.shift();
    if (this._recentDeadCounts.length > WINDOW) this._recentDeadCounts.shift();

    if (this.interventionTaken) return;
    if (this._recentLivingCounts.length < 15) return;

    const recentLiving = this._recentLivingCounts.slice(-20);
    const recentDead = this._recentDeadCounts.slice(-20);
    const livingSet = Array.from(new Set(recentLiving)).sort((a, b) => a - b);
    const deadSet = Array.from(new Set(recentDead)).sort((a, b) => a - b);
    const hasLivingChange = livingSet.length > 1;
    const hasDeadChange = deadSet.length > 1;

    // Never intervene for flat traces (no population fluctuation).
    if (!hasLivingChange || !hasDeadChange) return;

    const findRepeatingPeriod = (values: number[], maxPeriod = 10, minRepeats = 3): number | null => {
      const n = values.length;
      for (let period = 1; period <= maxPeriod; period++) {
        const span = period * minRepeats;
        if (n < span) continue;
        const start = n - span;
        let matches = true;
        for (let i = start + period; i < n; i++) {
          if (values[i] !== values[i - period]) {
            matches = false;
            break;
          }
        }
        if (matches) return period;
      }
      return null;
    };

    // Detect repeated oscillation over a narrow (<=5 value) band for both living and dead counts.
    const inFiveValueBand =
      hasLivingChange &&
      hasDeadChange &&
      livingSet.length <= 5 &&
      deadSet.length <= 5;
    const livingPeriod = findRepeatingPeriod(recentLiving);
    const deadPeriod = findRepeatingPeriod(recentDead);
    const explosivePattern = inFiveValueBand && livingPeriod !== null && deadPeriod !== null;
    if (!explosivePattern) return;

    this.interventionTaken = true;
    this.interventionTitle = 'Emergency intervention taken';
    this.interventionReason =
      'Explosive automata detected: slowing simulation to prevent harm to equiepemnt';
    this.interventionUpdateRateMs = 3000;
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
      const dvKey = `${dim}-${viewer}`;
      const lat = this._latticeHistory.get(dvKey) ?? defaultLattice(dim);
      const key = historyKey(dim, viewer, lat);
      const combo: ComboSettings = {
        populationShape: this._shapeHistory.get(key) ?? defaultShape(dim, viewer),
        rule: this._ruleHistory.get(key) ?? defaultRule(dim, lat),
        cellStates: this._cellStatesHistory.get(key) ?? defaultCellStates(dim, viewer),
        neighborhoodRadius: this._radiusHistory.get(key) ?? 1,
        lattice: lat !== defaultLattice(dim) ? lat : undefined,
      };
      const savedSR = this._shapeRulesHistory.get(key);
      if (savedSR) combo.shapeRules = savedSR.map(r => ({ ...r }));
      result[dvKey] = combo;
    }
    return result;
  }

  hydrateCombo(dim: number, viewer: number, settings: Partial<ComboSettings>) {
    const lat = settings.lattice ?? defaultLattice(dim);
    const dvKey = `${dim}-${viewer}`;
    if (lat !== defaultLattice(dim)) {
      this._latticeHistory.set(dvKey, lat);
    } else {
      // Clear any non-default lattice from a previous localStorage hydration,
      // so hydrateActive uses the correct (default) lattice key for lookups.
      this._latticeHistory.delete(dvKey);
    }
    const key = historyKey(dim, viewer, lat);
    if (settings.populationShape) {
      this._shapeHistory.set(key, { ...settings.populationShape });
    }
    if (settings.rule) {
      this._ruleHistory.set(key, { ...settings.rule });
    }
    if (settings.cellStates) {
      this._cellStatesHistory.set(key, this._enforceLivingBlack(settings.cellStates));
    }
    if (settings.neighborhoodRadius !== undefined) {
      this._radiusHistory.set(key, settings.neighborhoodRadius);
    }
    if (settings.shapeRules) {
      this._shapeRulesHistory.set(key, settings.shapeRules.map(r => ({ ...r })));
    }
  }

  hydrateActive(dim: number, viewer: number) {
    const dvKey = `${dim}-${viewer}`;
    const lat = this._latticeHistory.get(dvKey) ?? defaultLattice(dim);
    const key = historyKey(dim, viewer, lat);
    this.dimension = dim;
    this.viewer = viewer;
    this.lattice = lat;
    this.neighborhoodRadius = this._radiusHistory.get(key) ?? 1;
    this._setFullNeighbors(defaultNeighbors(dim, this.neighborhoodRadius, lat));
    this.populationShape = this._shapeHistory.get(key)
      ? { ...this._shapeHistory.get(key)! }
      : defaultShape(dim, viewer);
    this.rule = this._ruleHistory.get(key)
      ? { ...this._ruleHistory.get(key)! }
      : defaultRule(dim, lat);
    this.cellStates = this._cellStatesHistory.get(key)
      ? this._enforceLivingBlack(this._cellStatesHistory.get(key)!)
      : defaultCellStates(dim, viewer);
    const savedSR = this._shapeRulesHistory.get(key);
    if (savedSR) {
      this.shapeRules = savedSR.map(r => ({ ...r }));
    } else {
      const config = getLattice(lat);
      this.shapeRules = config.shapes
        ? config.shapes.map(s => ({ survive: [...s.defaultRule.survive], born: [...s.defaultRule.born] }))
        : null;
    }
  }

  // --- Export for save ---
  exportForSave() {
    const rule = this.rule;
    const ruleType = rule.type;
    let ruleDefinition: string;
    if (rule.type === 'wolfram') {
      ruleDefinition = `W${rule.rule}`;
    } else {
      ruleDefinition = `B${rule.born.join(',')}S${rule.survive.join(',')}`;
    }

    let stability: 'evolving' | 'quasi_stable' | 'fixed' = 'evolving';
    if (this.stableKind === 'exact') stability = 'fixed';
    else if (this.stableKind === 'quasi') stability = 'quasi_stable';

    const seedSnapshot = this.getSeedSnapshot?.();
    const seedPopulation = seedSnapshot
      ? btoa(String.fromCharCode(...seedSnapshot))
      : undefined;

    let shapeRulesDefinition: string | undefined;
    if (this.shapeRules) {
      shapeRulesDefinition = this.shapeRules
        .map(r => `B${r.born.join(',')}S${r.survive.join(',')}`)
        .join(';');
    }

    return {
      dimension: this.dimension,
      viewer: this.viewer,
      lattice: this.lattice !== defaultLattice(this.dimension) ? this.lattice : undefined,
      ruleType,
      ruleDefinition,
      shapeRulesDefinition,
      populationShape: JSON.stringify(this.populationShape),
      cellStates: JSON.stringify(this.cellStates),
      neighborhoodRadius: this.neighborhoodRadius,
      generationIndex: this.generationIndex,
      stability,
      stablePeriod: this.stablePeriod || null,
      seedPopulation
    };
  }

  // --- Internal helpers ---
  private _saveToHistory() {
    const key = historyKey(this.dimension, this.viewer, this.lattice);
    this._shapeHistory.set(key, { ...this.populationShape });
    this._cellStatesHistory.set(
      key,
      this.cellStates.map((s) => ({ ...s }))
    );
    this._ruleHistory.set(key, { ...this.rule });
    this._radiusHistory.set(key, this.neighborhoodRadius);
    this._latticeHistory.set(`${this.dimension}-${this.viewer}`, this.lattice);
    if (this.shapeRules) {
      this._shapeRulesHistory.set(key, this.shapeRules.map(r => ({ ...r })));
    }
  }

  private _setFullNeighbors(allNeighbors: string[]) {
    this.allNeighborsForRadius = [...allNeighbors];
    this.neighborEnabled = allNeighbors.map(() => true);
    this.neighbors = [...allNeighbors];
  }

  private _minRadiusForNeighborCount(dim: number, count: number): number {
    if (dim === 1) {
      for (let r = 1; r <= 10; r++) {
        if (2 * r >= count) return r;
      }
      return 10;
    }
    for (let r = 1; r <= 10; r++) {
      const nc = generateNeighborhood(this.lattice, r).neighborCount;
      if (nc >= count) return r;
    }
    return 10;
  }

  private _restoreOrDefault() {
    // Restore lattice from history if available
    const dvKey = `${this.dimension}-${this.viewer}`;
    const savedLattice = this._latticeHistory.get(dvKey);
    if (savedLattice) {
      this.lattice = savedLattice;
    }
    const key = historyKey(this.dimension, this.viewer, this.lattice);

    const savedShape = this._shapeHistory.get(key);
    this.populationShape = savedShape
      ? { ...savedShape }
      : defaultShape(this.dimension, this.viewer);

    const savedStates = this._cellStatesHistory.get(key);
    this.cellStates = savedStates
      ? this._enforceLivingBlack(savedStates)
      : defaultCellStates(this.dimension, this.viewer);

    const savedRule = this._ruleHistory.get(key);
    this.rule = savedRule
      ? { ...savedRule }
      : defaultRule(this.dimension, this.lattice);

    // Restore radius
    this.neighborhoodRadius = this._radiusHistory.get(key) ?? 1;
    this._setFullNeighbors(defaultNeighbors(this.dimension, this.neighborhoodRadius, this.lattice));

    // Restore shape rules
    const savedSR = this._shapeRulesHistory.get(key);
    if (savedSR) {
      this.shapeRules = savedSR.map(r => ({ ...r }));
    } else {
      const config = getLattice(this.lattice);
      this.shapeRules = config.shapes
        ? config.shapes.map(s => ({ survive: [...s.defaultRule.survive], born: [...s.defaultRule.born] }))
        : null;
    }
  }
}

export const automataStore = new AutomataStore();
