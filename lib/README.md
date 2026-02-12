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

### Single-Shape vs Multi-Shape Lattices

**Single-shape lattices** (square, hex, cubic, etc.) have one cell type with uniform neighbor offsets. Every cell in the grid uses the same geometry and the same rule.

**Multi-shape lattices** (triangular, truncated square, etc.) tile the plane with multiple polygon types. Different cells have different neighbor counts and can run independent rulesets. The lattice definition includes a `shapes` array describing each cell type's geometry, scale, rotation, neighbor count, and default rule. The engine uses `shapeAt(x, y)` to determine which shape occupies each grid position and selects the correct offsets and rules per cell.

### Supported Lattice Types

| Type | Dim | Shapes | r=1 Neighbors | Strategy |
|------|-----|--------|---------------|----------|
| `square` | 2 | 1 (box) | 8 | Moore (Chebyshev distance) |
| `hexagonal` | 2 | 1 (hexprism) | 6 | Axial distance formula |
| `triangular` | 2 | 2 (up/down triprism) | 6 | Multi-shape BFS |
| `truncated_square` | 2 | 2 (octprism + box) | 8 oct / 4 sq | Multi-shape BFS |
| `cubic` | 3 | 1 (box) | 26 | Moore 3D |
| `fcc` | 3 | 1 (sphere) | 12 | BFS with face-diagonal offsets |
| `hexagonal_prism` | 3 | 1 (hexprism) | 20 | BFS with hex prism offsets |

### How Neighborhoods Work

Each lattice defines a `neighborhood(radius: number) => NeighborhoodConfig` function. The returned config contains:

- `offsets2D` / `offsets3D` — typed offset tuples for the fast generation path
- `neighborStrings` — `"x+1|y-1"` format strings for the generic extraction path
- `neighborCount` — max neighbor count across all shapes (sizes rule lookup tables)

For multi-shape lattices, the config additionally includes:

- `shapeCount` — number of distinct cell shapes
- `shapeAt(x, y)` — returns the shape index at any grid position
- `shapeOffsets2D[shapeIndex]` — per-shape neighbor offsets
- `shapeNeighborCounts[shapeIndex]` — per-shape neighbor counts

**Neighborhood strategies by lattice:**

**Square / Cubic** — Chebyshev distance. All cells where `max(|dx|, |dy|, ...)` <= r. Classic Moore neighborhood: r=1 gives 8 (2D) or 26 (3D).

**Hexagonal** — Axial distance formula. All cells where `max(|dq|, |dr|, |dq+dr|)` <= r. Produces natural hex rings: 6 at r=1, 18 at r=2.

**Triangular** — Multi-shape BFS with checkerboard parity. Up triangles (even parity) and down triangles (odd parity) have different r=1 offsets. `bfsMultiShape2D` expands from each shape type independently, using `shapeAt` to determine which offsets apply at each BFS frontier cell.

**Truncated Square** — Multi-shape BFS with checkerboard parity. Octagons (even parity, 8 Moore neighbors) and squares (odd parity, 4 Von Neumann neighbors) tile the plane. Each shape expands through neighbors of alternating type.

**FCC / Hex Prism** — Uniform BFS with fixed base offsets. Expands from origin using r=1 offsets as hop directions.

### Multi-Shape Visualization

Multi-shape lattices include a `shapes` array on their `LatticeDefinition`:

```ts
interface ShapeInfo {
  label: string;                    // "Octagon", "Square"
  neighborCount: number;            // r=1 count for this shape
  defaultRule: { survive: number[]; born: number[] };
  geometry: GeometryType;           // 'box' | 'hexprism' | 'triprism' | 'octprism' | 'sphere'
  geometryScale: number;            // size relative to grid cell spacing
  geometryRotationY: number;        // rotation around Y axis in radians
}
```

The `geometryScale` ensures shapes are sized correctly relative to each other. For the truncated square tiling:
- Octagon scale = `√2 / cos(π/8)` ≈ 1.53 (extends beyond grid cell)
- Square scale = `2 - √2` ≈ 0.59 (fits in the gap between octagons)

These values are derived from the tiling geometry: the octagon's apothem plus the square's half-side equals exactly the grid cell spacing, so shapes tile without gaps or overlap.

The `geometryRotationY` orients shapes correctly. For octagons, `π/8` aligns flat edges with all 8 grid directions (4 cardinal + 4 diagonal). For triangles, `±π/2` points up vs down.

### Adding a New Lattice Type

1. Add to the `LatticeType` union in `lattice.ts`
2. Add an entry to `LATTICE_REGISTRY` with a `neighborhood` function

For **single-shape** lattices, set `geometry` on the definition. That's it.

For **multi-shape** lattices:
1. Define a `shapes` array with each shape's geometry, scale, rotation, neighbor count, and default rule
2. Define per-shape r=1 offset arrays
3. Implement `shapeAt(x, y)` to map grid positions to shape indices
4. Use `bfsMultiShape2D()` in the `neighborhood()` function to compute per-shape offsets at any radius
5. If a new geometry type is needed, add a case to `_createGeometryForType()` in the viewers

## Engine (AutomataManager)

`lib/automata/index.ts` — orchestrates population generation.

### Generation Paths

The engine has two generation paths:

**Fast path** — direct array iteration with pre-parsed numeric offsets and `Uint8Array` born/survive lookup tables. Three variants:
- `_fastGenerate2D()` — uniform offsets (square, hex)
- `_fastGenerateMultiShape2D()` — per-shape offsets and per-shape rules (triangular, truncated square)
- `_fastGenerate3D()` — 3D offsets (cubic, FCC, hex prism)

All fast paths use toroidal wrapping: `((x + off) % N + N) % N`.

**Generic path** — uses `neighborhoodStateExtractor` coordinate extractors, state reducers, and rule applicators. Used for 1D Wolfram rules and as a fallback.

### Key Methods

```ts
// Set lattice type and radius — configures offsets and rule lookups
manager.setLattice('truncated_square', 1);

// Set per-shape rules for multi-shape lattices
manager.setShapeRules([
  { survive: [2, 3], born: [3] },   // octagon
  { survive: [1, 2], born: [1] },   // square
]);

// Set population shape, seed, and run
manager.populationShape = { x: 70, y: 50 };
manager.getSeedPopulation();
const nextPop = manager.run();
```

### Lattice Integration

`setLattice(type, radius)` calls `generateNeighborhood(type, radius)` and:
1. Sets neighbor strings on the generic extraction path
2. Overrides fast-path offset arrays with typed tuples
3. For multi-shape: stores `shapeAt`, `shapeOffsets2D`, builds per-shape born/survive lookups
4. For single-shape: rebuilds born/survive lookup tables for the new neighbor count

The routing in `generateNextPopulationFromCurrent()` checks `this._shapeAt` to select the multi-shape fast path; single-shape 2D uses `_fastGenerate2D`, all 3D uses `_fastGenerate3D`.

## Viewers

Each viewer extends `BaseViewer` (`lib/viewer/base/index.ts`) and receives `latticeType` in its constructor options.

### Lattice-Aware Rendering

**Position** — viewers call `lattice.position2D(col, row, size)` or `lattice.position3D(x, y, z, size)` from the registry to place cells. Each lattice defines its own coordinate mapping.

**Geometry** — for single-shape lattices, viewers use `lattice.geometry` to select from:
- `'box'` → `BoxGeometry`
- `'hexprism'` → `CylinderGeometry(r, r, h, 6)` rotated π/6
- `'triprism'` → `CylinderGeometry(r, r, h, 3)`
- `'octprism'` → `CylinderGeometry(r, r, h, 8)`
- `'sphere'` → `IcosahedronGeometry(r, 1)`

For multi-shape lattices, the 2D-in-3D viewer creates one geometry per shape from `lattice.shapes`, applying each shape's `geometryScale` and `geometryRotationY`. During rendering, `shapeAt(col, row)` selects the correct geometry per cell.

## Exports

All public API is re-exported from `lib/index.ts`:

```ts
// Engine
AutomataManager, PopulationManager, populationSeed

// Lattice
getLattice, generateNeighborhood, latticesForDimension,
defaultLattice, isValidLattice, LATTICE_REGISTRY
// Types: LatticeType, LatticeDefinition, NeighborhoodConfig, ShapeInfo, GeometryType

// Viewers
OneDimensionInTwoDimensions, TwoDimensionInTwoDimensions,
TwoDimensionInThreeDimensions, ThreeDimensionInThreeDimensions

// Neighborhood extraction
generateMooreNeighbors1D  // still used for 1D (no lattice system)
```
