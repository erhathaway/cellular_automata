# lib — Core Automata Engine & Viewers

Framework-agnostic library powering the cellular automata simulator. No Svelte, no React — just TypeScript, pure automata logic, and Three.js rendering.

## Structure

```
lib/
  index.ts                  # Public exports
  automata/
    index.ts                # AutomataManager — engine orchestrator
    lattice.ts              # Lattice registry & neighborhood generation
    populationManager.ts    # Population seeding & resizing
    populationSeed.ts       # Seed strategies & shape types
    neighborhoodStateExtractor.ts  # Coordinate extractors & Moore generators
    stateReducer.ts         # Neighbor count reduction
    ruleApplicator.ts       # Wolfram & life-like rule evaluation
  viewer/
    base/index.ts           # BaseViewer — shared Three.js scaffolding
    OneDimensionInTwoDimensions.ts
    TwoDimensionInTwoDimensions.ts
    TwoDimensionInThreeDimensions.ts
    ThreeDimensionInThreeDimensions.ts
```

## Lattice System

All 2D and 3D grids go through a unified lattice registry (`lib/automata/lattice.ts`). Each lattice type defines its own geometry, positioning, default rules, and — critically — a `neighborhood(radius)` function that generates the correct neighbor offsets at any radius.

### Supported Lattice Types

| Type | Dim | r=1 Neighbors | Neighborhood Strategy | Geometry |
|------|-----|---------------|----------------------|----------|
| `square` | 2 | 8 | Moore (Chebyshev distance) | box |
| `hexagonal` | 2 | 6 | Axial distance formula | hexprism |
| `triangular` | 2 | 6 | BFS with parity offsets | triprism |
| `cubic` | 3 | 26 | Moore 3D (Chebyshev distance) | box |
| `fcc` | 3 | 12 | BFS with face-diagonal offsets | sphere |
| `hexagonal_prism` | 3 | 20 | BFS with hex prism offsets | hexprism |

### How Neighborhoods Work

Each lattice defines a `neighborhood(radius: number) => NeighborhoodConfig` function. This is the single source of truth for neighbor computation at any radius. The returned `NeighborhoodConfig` contains:

- `offsets2D` / `offsets3D` — typed offset tuples for the fast generation path
- `parityOffsets` — for lattices with mixed cell shapes (e.g. triangular up/down)
- `neighborStrings` — `"x+1|y-1"` format strings for the generic extraction path
- `neighborCount` — total neighbor count (used to size rule lookup tables)

**Neighborhood strategies by lattice:**

**Square / Cubic** — Chebyshev distance. All cells where `max(|dx|, |dy|, ...)` <= r. This is the classic Moore neighborhood: r=1 gives 8 (2D) or 26 (3D), r=2 gives 24 or 124, etc.

**Hexagonal** — Axial distance formula. All cells where `max(|dq|, |dr|, |dq+dr|)` <= r. Produces the natural hex rings: 6 at r=1, 18 at r=2, 36 at r=3.

**Triangular** — BFS with parity-dependent offsets. Triangular grids have two cell shapes (up/down triangles) with different neighbor positions. At r=1, each triangle touches 6 neighbors (3 edge-sharing + 3 vertex-sharing). The BFS runs separately for even-parity and odd-parity origins, producing two offset sets that the engine selects per-cell based on `(x + y) % 2`.

**FCC / Hex Prism** — BFS with fixed base offsets. Expands from the origin using the lattice's r=1 offsets as hop directions, collecting all unique cells reachable within r hops.

### Registry Entry

Each entry in `LATTICE_REGISTRY` is a `LatticeDefinition`:

```ts
interface LatticeDefinition {
  type: LatticeType;
  label: string;                  // UI display name
  dimension: 2 | 3;
  neighborCount: number;          // r=1 count (for UI display)
  defaultRule: { survive: number[]; born: number[] };
  neighborhood: (radius: number) => NeighborhoodConfig;
  position2D?: (col, row, size) => { x, y };
  position3D?: (x, y, z, size) => { px, py, pz };
  geometry: 'box' | 'hexprism' | 'triprism' | 'sphere';
}
```

### Adding a New Lattice Type

1. Add to the `LatticeType` union in `lattice.ts`
2. Add an entry to `LATTICE_REGISTRY` with a `neighborhood` function
3. That's it for basic lattices — the engine, viewers, UI, and persistence all read from the registry

Only if needed:
- **Parity-dependent offsets**: return `parityOffsets` from `neighborhood()`. The engine's `_fastGenerateTri2D` handles this pattern — or add a new fast method for a structurally different pattern.
- **New geometry type**: add a case to `_createCellGeometry()` in the relevant viewer(s).

## Engine (AutomataManager)

`lib/automata/index.ts` — orchestrates population generation.

### Generation Paths

The engine has two generation paths:

**Fast path** — direct array iteration with pre-parsed numeric offsets and `Uint8Array` born/survive lookup tables. Used for all 2D and 3D life-like rules. Three variants:
- `_fastGenerate2D()` — uniform offsets (square, hex)
- `_fastGenerateTri2D()` — parity-dependent offsets (triangular)
- `_fastGenerate3D()` — 3D offsets (cubic, FCC, hex prism)

All fast paths use toroidal wrapping: `((x + off) % N + N) % N`.

**Generic path** — uses `neighborhoodStateExtractor` coordinate extractors, state reducers, and rule applicators. Used for 1D Wolfram rules and as a fallback. Also supports toroidal wrapping via modular arithmetic.

### Key Methods

```ts
// Set lattice type and radius — configures offsets, parity, and rule lookups
manager.setLattice('hexagonal', 2);

// Set population shape
manager.populationShape = { x: 100, y: 100 };

// Set rule
manager.rule = { survive: [2, 3], born: [3] };

// Seed and run
manager.getSeedPopulation();
const nextPop = manager.run();
```

### Lattice Integration

`setLattice(type, radius)` calls `generateNeighborhood(type, radius)` and:
1. Sets the neighbor strings on the generic extraction path
2. Overrides fast-path offset arrays with typed tuples
3. Sets parity offsets for triangular
4. Rebuilds born/survive lookup tables for the new neighbor count

The routing in `generateNextPopulationFromCurrent()` checks `this._latticeType === 'triangular'` to select the parity-aware fast path; all other 2D lattices share `_fastGenerate2D`, all 3D share `_fastGenerate3D`.

## Viewers

Each viewer extends `BaseViewer` (`lib/viewer/base/index.ts`) and receives `latticeType` in its constructor options.

### Lattice-Aware Rendering

**Position** — viewers call `lattice.position2D(col, row, size)` or `lattice.position3D(x, y, z, size)` from the registry to place cells. Each lattice defines its own coordinate mapping (hex uses axial-to-cartesian, triangular uses alternating row offsets, etc.).

**Geometry** — 3D viewers use `_createCellGeometry(diameter)` factories that select geometry based on `lattice.geometry`:
- `'box'` → `BoxGeometry`
- `'hexprism'` → `CylinderGeometry(r, r, h, 6)` rotated 30 degrees
- `'triprism'` → `CylinderGeometry(r, r, h, 3)`
- `'sphere'` → `IcosahedronGeometry(r, 1)`

## Exports

All public API is re-exported from `lib/index.ts`:

```ts
// Engine
AutomataManager, PopulationManager, populationSeed

// Lattice
getLattice, generateNeighborhood, latticesForDimension,
defaultLattice, isValidLattice, LATTICE_REGISTRY
// Types: LatticeType, LatticeDefinition, NeighborhoodConfig

// Viewers
OneDimensionInTwoDimensions, TwoDimensionInTwoDimensions,
TwoDimensionInThreeDimensions, ThreeDimensionInThreeDimensions

// Neighborhood extraction
generateMooreNeighbors1D  // still used for 1D (no lattice system)
```
