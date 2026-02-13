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
  role: string;
  color: HSLColor;
}

export type TrailStepFn = 'linear' | 'exponential' | 'none';

export interface TrailConfig {
  color: HSLColor;
  size: number;
  stepFn: TrailStepFn;
}

export interface CellStatesData {
  states: CellStateEntry[];
  trail: TrailConfig;
}

export function defaultTrailConfig(aliveColor: HSLColor): TrailConfig {
  return {
    color: { h: (aliveColor.h + 180) % 360, s: 1, l: 0.65, a: 1 },
    size: 10,
    stepFn: 'linear',
  };
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
  trailConfig?: TrailConfig;
  neighborhoodRadius?: number;
  lattice?: LatticeType;
  shapeRules?: { survive: number[]; born: number[] }[];
}

export type MiningDifficulty = 'random' | 'easy' | 'medium' | 'hard';

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
  return [{ role: 'dead', color: white }, { role: 'alive', color: { ...LIVING_BLACK } }];
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
    { role: 'dead', color: { h: 360, s: 1, l: 1, a: 1 } },
    { role: 'alive', color: { ...LIVING_BLACK } },
  ]);
  trailConfig: TrailConfig = $state(defaultTrailConfig(LIVING_BLACK));
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

  // Keyframe tracking for progress bar
  keyframeCount = $state(0);
  absoluteGeneration = $state(0);
  keyframeSeekTarget: number | null = $state(null);

  // Mining animation state
  isMining = $state(false);
  miningDifficulty: MiningDifficulty = $state('medium');
  miningLattice: LatticeType | 'random' = $state('random');
  claimAnimationCounter = $state(0);
  claimGemOrigin: { x: number; y: number } | null = $state(null);
  mineGemAnimationCounter = $state(0);
  mineGemOrigin: { x: number; y: number } | null = $state(null);

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

  /** True when the current automata is in a healthy, claimable state (not extinct, frozen, or under intervention) */
  get isViableAutomata(): boolean {
    if (this.allAutomataDied) return false;
    if (this.stableKind === 'exact' && this.stablePeriod <= 1) return false;
    if (this.interventionTaken) return false;
    return true;
  }

  // Per-shape rules for multi-shape lattices (null = single-shape)
  shapeRules: { survive: number[]; born: number[] }[] | null = $state(null);

  // Persistence hydration flag — true once PersistenceManager has applied URL/localStorage state
  hydrated = $state(false);

  // Advanced mode lock state
  advancedMode = $state(false);
  lockCell = $state(false);
  lockViewer = $state(false);
  lockLattice = $state(false);
  lockRadius = $state(false);
  lockBorn = $state(false);
  lockSurvive = $state(false);
  lockShapeBorn: boolean[] = $state([]);
  lockShapeSurvive: boolean[] = $state([]);
  lockNeighborhood = $state(false);
  lockColors = $state(false);

  // Per-shape neighbor enabled for multi-shape lattices
  shapeNeighborEnabled: boolean[][] = $state([]);

  // Seed population state
  savedSeed: Uint8Array | null = $state(null);
  useSavedSeed: boolean = $state(true);

  // Generation run ID — links to a specific claimed snapshot for reproducible URLs
  generationRunId: string | null = $state(null);

  // Preview callbacks (set by ViewPlayer, not reactive)
  getPopulationAtIndex: ((index: number) => any) | null = null;
  getKeyframePopulation: ((index: number) => any) | null = null;
  getKeyframeGeneration: ((index: number) => number | null) | null = null;
  renderPreviewFrame: ((populations: any[], canvas: HTMLCanvasElement) => void) | null = null;
  getCanvasDataURL: (() => string | null) | null = null;
  captureThumbnail: (() => string | null) | null = null;
  getSeedSnapshot: (() => Uint8Array | null) | null = null;
  getCurrentPopulationSnapshot: (() => Uint8Array | null) | null = null;

  // Snapshotted rendering params for preview (set alongside callbacks, avoids stale colors)
  previewCellStates: CellStateEntry[] | null = null;
  previewTrailConfig: TrailConfig | null = null;

  // Indexed history for shape, cellStates, rule, radius, and lattice
  private _shapeHistory: Map<string, Record<string, number>> = new Map();
  private _cellStatesHistory: Map<string, CellStateEntry[]> = new Map();
  private _trailConfigHistory: Map<string, TrailConfig> = new Map();
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
      { role: 'dead', color: { h: 360, s: 1, l: 1, a: 1 } },
      { role: 'alive', color: { ...LIVING_BLACK } },
    ]);
    this._trailConfigHistory.set(key, defaultTrailConfig(LIVING_BLACK));
    this._ruleHistory.set(key, { type: 'conway', survive: [2, 3], born: [3] });
  }

  // --- Derived values ---
  get shapeKeys(): string[] {
    return Object.keys(this.populationShape);
  }

  get cellStatesForViewer(): CellStateEntry[] {
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
      // Resize per-shape lock arrays to match shape count
      this.lockShapeBorn = config.shapes.map(() => false);
      this.lockShapeSurvive = config.shapes.map(() => false);
    } else {
      this.shapeRules = null;
      this.lockShapeBorn = [];
      this.lockShapeSurvive = [];
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

  setCellStateColor(role: string, color: HSLColor) {
    this.cellStates = this.cellStates.map((s) =>
      s.role === role ? { ...s, color } : s
    );
    const key = historyKey(this.dimension, this.viewer);
    this._cellStatesHistory.set(
      key,
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

  toggleShapeNeighbor(shapeIndex: number, neighborIndex: number) {
    if (shapeIndex < 0 || shapeIndex >= this.shapeNeighborEnabled.length) return;
    const arr = this.shapeNeighborEnabled[shapeIndex];
    if (neighborIndex < 0 || neighborIndex >= arr.length) return;
    this.shapeNeighborEnabled = this.shapeNeighborEnabled.map((a, si) =>
      si === shapeIndex ? a.map((v, ni) => ni === neighborIndex ? !v : v) : a
    );
  }

  setAllShapeNeighborsEnabled(enabled: boolean) {
    this.shapeNeighborEnabled = this.shapeNeighborEnabled.map(a => a.map(() => enabled));
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
    this.keyframeCount = 0;
    this.absoluteGeneration = 0;
    this.keyframeSeekTarget = null;
    this.stableDetected = false;
    this.stablePeriod = 0;
    this.stableKind = 'none';
    this.clearIntervention();
  }

  randomizeRule() {
    this.savedSeed = null;
    this.useSavedSeed = true;
    this.generationRunId = null;

    // Granular lock flags — locking lattice implicitly locks cell dimension too
    const skipCell = this.advancedMode && (this.lockCell || this.lockLattice);
    const skipLattice = this.advancedMode && this.lockLattice;
    const skipRadius = this.advancedMode && this.lockRadius;
    const skipBorn = this.advancedMode && this.lockBorn;
    const skipSurvive = this.advancedMode && this.lockSurvive;
    const skipColors = this.advancedMode && this.lockColors;

    // Without advanced mode, constrain to 1D/2D cells and 2D viewer only
    const allow3D = this.advancedMode;
    if (!allow3D) {
      if (this.dimension === 3) this.setDimension(2); // cascades viewer to 2
      else if (this.viewer === 3) this.setViewer(2);
    }

    // Phase 1: Dimensions + Lattice
    if (!skipCell && !skipLattice) {
      // Both free — full randomization
      // Determine effective mining lattice (ignore 3D lattices when !allow3D)
      const effectiveLattice = this.miningLattice !== 'random' && (!allow3D && getLattice(this.miningLattice).dimension === 3)
        ? 'random'
        : this.miningLattice;

      if (effectiveLattice !== 'random') {
        const latticeDim = getLattice(effectiveLattice).dimension as 1 | 2 | 3;
        if (latticeDim !== this.dimension) {
          this.setDimension(latticeDim as 1 | 2 | 3);
        }
        if (effectiveLattice !== this.lattice) {
          this.setLattice(effectiveLattice);
        }
      } else {
        if (this.dimension <= 2) {
          const newDim = Math.random() < 0.5 ? 1 : 2;
          if (newDim !== this.dimension) {
            this.setDimension(newDim as 1 | 2);
          }
        }
        if (this.dimension >= 2) {
          const latticeDim = allow3D ? (this.dimension as 2 | 3) : 2;
          const available = latticesForDimension(latticeDim);
          const randomLattice = available[Math.floor(Math.random() * available.length)];
          if (randomLattice.type !== this.lattice) {
            this.setLattice(randomLattice.type);
          }
        }
      }
    } else if (skipCell && !skipLattice) {
      // Dimension locked, randomize lattice within current dimension
      const effectiveLattice = this.miningLattice !== 'random' && (!allow3D && getLattice(this.miningLattice).dimension === 3)
        ? 'random'
        : this.miningLattice;

      if (effectiveLattice !== 'random') {
        if (effectiveLattice !== this.lattice) {
          this.setLattice(effectiveLattice);
        }
      } else if (this.dimension >= 2) {
        const latticeDim = allow3D ? (this.dimension as 2 | 3) : 2;
        const available = latticesForDimension(latticeDim);
        const randomLattice = available[Math.floor(Math.random() * available.length)];
        if (randomLattice.type !== this.lattice) {
          this.setLattice(randomLattice.type);
        }
      }
    }
    // else: both locked, skip entirely

    // Phase 2: Radius
    if (!skipRadius) {
      const radiusByDifficulty: Record<Exclude<MiningDifficulty, 'random'>, number[]> = {
        easy: [1],
        medium: [2, 3],
        hard: [4, 5, 6],
      };
      const radiusPool = this.miningDifficulty === 'random'
        ? [1, 2, 3, 4, 5, 6]
        : radiusByDifficulty[this.miningDifficulty];
      const newRadius = radiusPool[Math.floor(Math.random() * radiusPool.length)];
      this.setNeighborhoodRadius(newRadius);
    }

    // Phase 3: Born / Survive
    if (this.dimension === 1 && this.neighborhoodRadius === 1) {
      // Wolfram — single rule number covers both born+survive
      if (!skipBorn && !skipSurvive) {
        this.setRule({ type: 'wolfram', rule: Math.floor(Math.random() * 256) });
      }
    } else {
      const latticeConfig = getLattice(this.lattice);

      if (latticeConfig.shapes && this.shapeRules) {
        // Multi-shape: per-shape lock arrays
        const anyShapeUnlocked = latticeConfig.shapes.some((_, si) =>
          !(this.advancedMode && this.lockShapeBorn[si]) ||
          !(this.advancedMode && this.lockShapeSurvive[si])
        );
        if (anyShapeUnlocked) {
          const newShapeRules = latticeConfig.shapes.map((shape, si) => {
            const maxN = shape.neighborCount;
            const pick = () => {
              const arr: number[] = [];
              for (let i = 0; i <= maxN; i++) {
                if (Math.random() < 0.25) arr.push(i);
              }
              return arr.length > 0 ? arr : [Math.floor(Math.random() * (maxN + 1))];
            };
            const existing = this.shapeRules![si];
            const shapeBornLocked = this.advancedMode && this.lockShapeBorn[si];
            const shapeSurviveLocked = this.advancedMode && this.lockShapeSurvive[si];
            return {
              survive: shapeSurviveLocked ? [...existing.survive] : pick(),
              born: shapeBornLocked ? [...existing.born] : pick(),
            };
          });
          this.shapeRules = newShapeRules;
          this.rule = { type: 'conway', survive: [...newShapeRules[0].survive], born: [...newShapeRules[0].born] };
          const key = historyKey(this.dimension, this.viewer, this.lattice);
          this._shapeRulesHistory.set(key, newShapeRules.map(r => ({ ...r })));
          this._ruleHistory.set(key, { ...this.rule });
        }
      } else if (!skipBorn || !skipSurvive) {
        // Single-shape: use global lockBorn/lockSurvive
        const maxNeighbors = this.neighbors.length;
        const pick = () => {
          const arr: number[] = [];
          for (let i = 0; i <= maxNeighbors; i++) {
            if (Math.random() < 0.25) arr.push(i);
          }
          return arr.length > 0 ? arr : [Math.floor(Math.random() * (maxNeighbors + 1))];
        };
        const currentRule = this.rule.type === 'conway' ? this.rule : { born: [], survive: [] };
        const born = skipBorn ? [...currentRule.born] : pick();
        const survive = skipSurvive ? [...currentRule.survive] : pick();
        this.setRule({ type: 'conway', survive, born });
      }
    }

    // Phase 4: Colors
    if (!skipColors) {
      if (this.dimension === 2) {
        const h1 = Math.floor(Math.random() * 360);
        const h0 = (h1 + 30 + Math.floor(Math.random() * 60)) % 360;
        this.setCellStateColor('dead', { h: h0, s: 0.3 + Math.random() * 0.4, l: 0.85 + Math.random() * 0.1, a: 1 });
        this.setCellStateColor('alive', { ...LIVING_BLACK });
        // Recompute trail color from new alive hue
        this.trailConfig = { ...this.trailConfig, color: { h: (h0 + 180) % 360, s: 1, l: 0.65, a: 1 } };
        this._trailConfigHistory.set(historyKey(this.dimension, this.viewer), { ...this.trailConfig });
      }
    }

    this.reset();
  }

  setAdvancedMode(active: boolean) { this.advancedMode = active; }
  setLockCell(v: boolean) { this.lockCell = v; }
  setLockViewer(v: boolean) { this.lockViewer = v; }
  setLockLattice(v: boolean) { this.lockLattice = v; }
  setLockRadius(v: boolean) { this.lockRadius = v; }
  setLockBorn(v: boolean) { this.lockBorn = v; }
  setLockSurvive(v: boolean) { this.lockSurvive = v; }
  setLockShapeBorn(i: number, v: boolean) {
    this.lockShapeBorn = this.lockShapeBorn.map((cur, idx) => idx === i ? v : cur);
  }
  setLockShapeSurvive(i: number, v: boolean) {
    this.lockShapeSurvive = this.lockShapeSurvive.map((cur, idx) => idx === i ? v : cur);
  }
  setLockNeighborhood(v: boolean) { this.lockNeighborhood = v; }
  setLockColors(v: boolean) { this.lockColors = v; }

  setTrailColor(color: HSLColor) {
    this.trailConfig = { ...this.trailConfig, color };
    this._trailConfigHistory.set(historyKey(this.dimension, this.viewer), { ...this.trailConfig });
  }

  setTrailSize(size: number) {
    this.trailConfig = { ...this.trailConfig, size };
    this._trailConfigHistory.set(historyKey(this.dimension, this.viewer), { ...this.trailConfig });
  }

  setTrailStepFn(fn: TrailStepFn) {
    this.trailConfig = { ...this.trailConfig, stepFn: fn };
    this._trailConfigHistory.set(historyKey(this.dimension, this.viewer), { ...this.trailConfig });
  }

  setMiningDifficulty(difficulty: MiningDifficulty) {
    this.miningDifficulty = difficulty;
  }

  setMiningLattice(lattice: LatticeType | 'random') {
    this.miningLattice = lattice;
  }

  resetMiningToRandom() {
    this.miningDifficulty = 'random';
    this.miningLattice = 'random';
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

  updateKeyframeInfo(count: number, absGen: number) {
    this.keyframeCount = count;
    this.absoluteGeneration = absGen;
  }

  seekToKeyframe(index: number) {
    this.keyframeSeekTarget = index;
  }

  clearKeyframeSeekTarget() {
    this.keyframeSeekTarget = null;
  }

  // --- Hydration API ---
  getAllComboSettings(): Record<string, ComboSettings> {
    this._saveToHistory();
    const result: Record<string, ComboSettings> = {};
    for (const [dim, viewer] of VALID_COMBOS) {
      const dvKey = `${dim}-${viewer}`;
      const lat = this._latticeHistory.get(dvKey) ?? defaultLattice(dim);
      const key = historyKey(dim, viewer, lat);
      const states = this._cellStatesHistory.get(key) ?? defaultCellStates(dim, viewer);
      const aliveState = states.find(s => s.role === 'alive');
      const combo: ComboSettings = {
        populationShape: this._shapeHistory.get(key) ?? defaultShape(dim, viewer),
        rule: this._ruleHistory.get(key) ?? defaultRule(dim, lat),
        cellStates: states,
        trailConfig: this._trailConfigHistory.get(key) ?? defaultTrailConfig(aliveState?.color ?? LIVING_BLACK),
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
      this._cellStatesHistory.set(key, settings.cellStates.map(s => ({ ...s })));
    }
    if (settings.trailConfig) {
      this._trailConfigHistory.set(key, { ...settings.trailConfig });
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
      ? { ...defaultShape(dim, viewer), ...this._shapeHistory.get(key)! }
      : defaultShape(dim, viewer);
    this.rule = this._ruleHistory.get(key)
      ? { ...this._ruleHistory.get(key)! }
      : defaultRule(dim, lat);
    this.cellStates = this._cellStatesHistory.get(key)
      ? this._cellStatesHistory.get(key)!.map(s => ({ ...s }))
      : defaultCellStates(dim, viewer);
    const savedTrail = this._trailConfigHistory.get(key);
    const aliveState = this.cellStates.find(s => s.role === 'alive');
    this.trailConfig = savedTrail
      ? { ...savedTrail }
      : defaultTrailConfig(aliveState?.color ?? LIVING_BLACK);
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

    const claimSnapshot = this.getCurrentPopulationSnapshot?.();
    const claimPopulation = claimSnapshot
      ? btoa(String.fromCharCode(...claimSnapshot))
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
      cellStates: JSON.stringify({ states: this.cellStates, trail: this.trailConfig }),
      neighborhoodRadius: this.neighborhoodRadius,
      generationIndex: this.generationIndex,
      stability,
      stablePeriod: this.stablePeriod || null,
      seedPopulation,
      claimPopulation
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
    this._trailConfigHistory.set(key, { ...this.trailConfig });
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
    // Initialize per-shape neighbor enabled for multi-shape lattices
    const config = getLattice(this.lattice);
    if (config.shapes) {
      const neighborhood = generateNeighborhood(this.lattice, this.neighborhoodRadius);
      if (neighborhood.shapeNeighborCounts) {
        this.shapeNeighborEnabled = neighborhood.shapeNeighborCounts.map(c =>
          new Array(c).fill(true)
        );
      }
    } else {
      this.shapeNeighborEnabled = [];
    }
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
      ? { ...defaultShape(this.dimension, this.viewer), ...savedShape }
      : defaultShape(this.dimension, this.viewer);

    const savedStates = this._cellStatesHistory.get(key);
    this.cellStates = savedStates
      ? savedStates.map(s => ({ ...s }))
      : defaultCellStates(this.dimension, this.viewer);

    const savedTrail = this._trailConfigHistory.get(key);
    const aliveState = this.cellStates.find(s => s.role === 'alive');
    this.trailConfig = savedTrail
      ? { ...savedTrail }
      : defaultTrailConfig(aliveState?.color ?? LIVING_BLACK);

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
