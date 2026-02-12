export type LatticeType = 'square' | 'hexagonal' | 'triangular' | 'cubic' | 'fcc' | 'hexagonal_prism' | 'truncated_square';

export type GeometryType = 'box' | 'hexprism' | 'triprism' | 'sphere' | 'octprism';

export interface NeighborhoodConfig {
  // Single-shape (uniform lattices)
  offsets2D?: [number, number][];
  offsets3D?: [number, number, number][];

  // Multi-shape (when shapeCount > 1)
  shapeCount?: number;                              // default 1
  shapeAt?: (x: number, y: number) => number;       // shape index at grid position
  shapeOffsets2D?: [number, number][][];             // offsets per shape index
  shapeNeighborCounts?: number[];                    // neighbor count per shape

  neighborStrings: string[];
  neighborCount: number;                             // max across all shapes
}

export interface ShapeInfo {
  label: string;
  neighborCount: number;
  defaultRule: { survive: number[]; born: number[] };
  geometry: GeometryType;
  geometryScale: number;        // size relative to grid cell spacing (1.0 = fill grid cell)
  geometryRotationY: number;    // rotation around Y axis in radians
}

export interface LatticeDefinition {
  type: LatticeType;
  label: string;
  dimension: 2 | 3;
  neighborCount: number;                         // r=1 max neighbor count (for UI display)
  defaultRule: { survive: number[]; born: number[] };
  neighborhood: (radius: number) => NeighborhoodConfig;
  position2D?: (col: number, row: number, size: number) => { x: number; y: number };
  position3D?: (x: number, y: number, z: number, size: number) => { px: number; py: number; pz: number };
  geometry?: GeometryType;       // for single-shape lattices (when shapes is undefined)
  shapes?: ShapeInfo[];          // for multi-shape lattices
}

const SQRT3 = Math.sqrt(3);

// --- Generate neighbor strings from offsets ---

function offsets2DToStrings(offsets: [number, number][]): string[] {
  return offsets.map(([dx, dy]) => {
    const xPart = dx === 0 ? 'x' : dx > 0 ? `x+${dx}` : `x${dx}`;
    const yPart = dy === 0 ? 'y' : dy > 0 ? `y+${dy}` : `y${dy}`;
    return `${xPart}|${yPart}`;
  });
}

function offsets3DToStrings(offsets: [number, number, number][]): string[] {
  return offsets.map(([dx, dy, dz]) => {
    const xPart = dx === 0 ? 'x' : dx > 0 ? `x+${dx}` : `x${dx}`;
    const yPart = dy === 0 ? 'y' : dy > 0 ? `y+${dy}` : `y${dy}`;
    const zPart = dz === 0 ? 'z' : dz > 0 ? `z+${dz}` : `z${dz}`;
    return `${xPart}|${yPart}|${zPart}`;
  });
}

// --- BFS helper for 3D lattices with uniform offsets ---

function bfs3D(baseOffsets: [number, number, number][], radius: number): NeighborhoodConfig {
  const visited = new Set<string>();
  visited.add('0,0,0');
  let frontier: [number, number, number][] = [[0, 0, 0]];

  for (let step = 0; step < radius; step++) {
    const nextFrontier: [number, number, number][] = [];
    for (const [x, y, z] of frontier) {
      for (const [dx, dy, dz] of baseOffsets) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        const key = `${nx},${ny},${nz}`;
        if (!visited.has(key)) {
          visited.add(key);
          nextFrontier.push([nx, ny, nz]);
        }
      }
    }
    frontier = nextFrontier;
  }

  const offsets: [number, number, number][] = [];
  for (const key of visited) {
    if (key === '0,0,0') continue;
    const [x, y, z] = key.split(',').map(Number);
    offsets.push([x, y, z]);
  }
  return { offsets3D: offsets, neighborStrings: offsets3DToStrings(offsets), neighborCount: offsets.length };
}

// --- BFS helper for multi-shape 2D lattices ---

function bfsMultiShape2D(
  r1OffsetsPerShape: [number, number][][],
  shapeAt: (x: number, y: number) => number,
  shapeCount: number,
  radius: number,
): { shapeOffsets: [number, number][][]; shapeNeighborCounts: number[] } {
  const shapeOffsets: [number, number][][] = [];
  const shapeNeighborCounts: number[] = [];

  for (let s = 0; s < shapeCount; s++) {
    // Find an exemplar position with this shape
    let ex = 0, ey = 0;
    outer: for (let y = 0; y < shapeCount * 2; y++) {
      for (let x = 0; x < shapeCount * 2; x++) {
        if (shapeAt(x, y) === s) { ex = x; ey = y; break outer; }
      }
    }

    // BFS from (0,0) using exemplar to determine neighbor shapes
    const visited = new Set<string>();
    visited.add('0,0');
    let frontier: [number, number][] = [[0, 0]];

    for (let step = 0; step < radius; step++) {
      const nextFrontier: [number, number][] = [];
      for (const [dx, dy] of frontier) {
        const cellShape = shapeAt(ex + dx, ey + dy);
        const offsets = r1OffsetsPerShape[cellShape];
        for (const [ox, oy] of offsets) {
          const nx = dx + ox;
          const ny = dy + oy;
          const key = `${nx},${ny}`;
          if (!visited.has(key)) {
            visited.add(key);
            nextFrontier.push([nx, ny]);
          }
        }
      }
      frontier = nextFrontier;
    }

    const offsets: [number, number][] = [];
    for (const key of visited) {
      if (key === '0,0') continue;
      const [cx, cy] = key.split(',').map(Number);
      offsets.push([cx, cy]);
    }

    shapeOffsets.push(offsets);
    shapeNeighborCounts.push(offsets.length);
  }

  return { shapeOffsets, shapeNeighborCounts };
}

// --- Safe modulo shape-at for checkerboard patterns ---

function checkerboardShapeAt(x: number, y: number): number {
  return ((x + y) % 2 + 2) % 2;
}

// --- Base offset definitions ---

// Triangular r=1 offsets per parity (up=even, down=odd)
const TRI_UP: [number, number][] = [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [0, 1]];
const TRI_DOWN: [number, number][] = [[-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1], [0, -1]];

// Truncated square r=1 offsets per shape (octagon=0, square=1)
const TRUNC_SQ_OCT: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];
const TRUNC_SQ_SQ: [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

// FCC 12 face-diagonal neighbors
const FCC_12: [number, number, number][] = [
  [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
  [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
  [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1],
];

// Hex prism: 6 in-plane hex + 7 above + 7 below = 20
const HEX_PRISM_20: [number, number, number][] = [
  // in-plane
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [1, -1, 0], [-1, 1, 0],
  // above
  [0, 0, 1], [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, -1, 1], [-1, 1, 1],
  // below
  [0, 0, -1], [1, 0, -1], [-1, 0, -1], [0, 1, -1], [0, -1, -1], [1, -1, -1], [-1, 1, -1],
];

// --- Registry ---

export const LATTICE_REGISTRY: Record<LatticeType, LatticeDefinition> = {
  square: {
    type: 'square',
    label: 'Square',
    dimension: 2,
    neighborCount: 8,
    defaultRule: { survive: [2, 3], born: [3] },
    neighborhood(radius) {
      const offsets: [number, number][] = [];
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) continue;
          offsets.push([dx, dy]);
        }
      }
      return { offsets2D: offsets, neighborStrings: offsets2DToStrings(offsets), neighborCount: offsets.length };
    },
    position2D: (col, row, size) => ({ x: size * col, y: size * row }),
    geometry: 'box',
  },
  hexagonal: {
    type: 'hexagonal',
    label: 'Hex',
    dimension: 2,
    neighborCount: 6,
    defaultRule: { survive: [3, 4], born: [2] },
    neighborhood(radius) {
      const offsets: [number, number][] = [];
      for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = -radius; dr <= radius; dr++) {
          if (dq === 0 && dr === 0) continue;
          if (Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= radius) {
            offsets.push([dq, dr]);
          }
        }
      }
      return { offsets2D: offsets, neighborStrings: offsets2DToStrings(offsets), neighborCount: offsets.length };
    },
    position2D: (col, row, size) => ({
      x: size * (SQRT3 * col + (SQRT3 / 2) * row),
      y: size * 1.5 * row,
    }),
    geometry: 'hexprism',
  },
  triangular: {
    type: 'triangular',
    label: 'Tri',
    dimension: 2,
    neighborCount: 6,
    defaultRule: { survive: [2, 3], born: [2] },
    shapes: [
      { label: 'Up', neighborCount: 6, defaultRule: { survive: [2, 3], born: [2] },
        geometry: 'triprism', geometryScale: 2, geometryRotationY: Math.PI / 2 },
      { label: 'Down', neighborCount: 6, defaultRule: { survive: [2, 3], born: [2] },
        geometry: 'triprism', geometryScale: 2, geometryRotationY: -Math.PI / 2 },
    ],
    neighborhood(radius) {
      const { shapeOffsets, shapeNeighborCounts } = bfsMultiShape2D(
        [TRI_UP, TRI_DOWN], checkerboardShapeAt, 2, radius,
      );
      const maxCount = Math.max(...shapeNeighborCounts);
      return {
        shapeCount: 2,
        shapeAt: checkerboardShapeAt,
        shapeOffsets2D: shapeOffsets,
        shapeNeighborCounts,
        offsets2D: shapeOffsets[0],
        neighborStrings: offsets2DToStrings(shapeOffsets[0]),
        neighborCount: maxCount,
      };
    },
    position2D: (col, row, size) => {
      const halfWidth = size * SQRT3 / 2;
      const triHeight = size * 1.5;
      const isDown = (col + row) % 2 !== 0;
      return {
        x: col * halfWidth,
        y: row * triHeight + (isDown ? triHeight / 3 : 0),
      };
    },
  },
  truncated_square: {
    type: 'truncated_square',
    label: 'Trunc Sq',
    dimension: 2,
    neighborCount: 8,
    defaultRule: { survive: [2, 3], born: [3] },
    shapes: [
      { label: 'Octagon', neighborCount: 8,
        defaultRule: { survive: [2, 3], born: [3] },
        geometry: 'octprism',
        geometryScale: Math.SQRT2 / Math.cos(Math.PI / 8),
        geometryRotationY: Math.PI / 8 },
      { label: 'Square', neighborCount: 4,
        defaultRule: { survive: [1, 2], born: [1] },
        geometry: 'box',
        geometryScale: 2 - Math.SQRT2,
        geometryRotationY: 0 },
    ],
    neighborhood(radius) {
      const { shapeOffsets, shapeNeighborCounts } = bfsMultiShape2D(
        [TRUNC_SQ_OCT, TRUNC_SQ_SQ], checkerboardShapeAt, 2, radius,
      );
      const maxCount = Math.max(...shapeNeighborCounts);
      return {
        shapeCount: 2,
        shapeAt: checkerboardShapeAt,
        shapeOffsets2D: shapeOffsets,
        shapeNeighborCounts,
        offsets2D: shapeOffsets[0],
        neighborStrings: offsets2DToStrings(shapeOffsets[0]),
        neighborCount: maxCount,
      };
    },
    position2D: (col, row, size) => ({ x: size * col, y: size * row }),
  },
  cubic: {
    type: 'cubic',
    label: 'Cubic',
    dimension: 3,
    neighborCount: 26,
    defaultRule: { survive: [4, 5], born: [5] },
    neighborhood(radius) {
      const offsets: [number, number, number][] = [];
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dz = -radius; dz <= radius; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue;
            offsets.push([dx, dy, dz]);
          }
        }
      }
      return { offsets3D: offsets, neighborStrings: offsets3DToStrings(offsets), neighborCount: offsets.length };
    },
    position3D: (x, y, z, size) => ({
      px: size * x,
      py: size * y,
      pz: size * z,
    }),
    geometry: 'box',
  },
  fcc: {
    type: 'fcc',
    label: 'FCC',
    dimension: 3,
    neighborCount: 12,
    defaultRule: { survive: [3, 4], born: [4] },
    neighborhood: (radius) => bfs3D(FCC_12, radius),
    position3D: (x, y, z, size) => ({
      px: size * x,
      py: size * y,
      pz: size * z,
    }),
    geometry: 'sphere',
  },
  hexagonal_prism: {
    type: 'hexagonal_prism',
    label: 'Hex Prism',
    dimension: 3,
    neighborCount: 20,
    defaultRule: { survive: [5, 6, 7], born: [5] },
    neighborhood: (radius) => bfs3D(HEX_PRISM_20, radius),
    position3D: (x, y, z, size) => ({
      px: size * (SQRT3 * x + (SQRT3 / 2) * y),
      py: size * z,
      pz: size * 1.5 * y,
    }),
    geometry: 'hexprism',
  },
};

// --- Helpers ---

export function getLattice(type: LatticeType): LatticeDefinition {
  return LATTICE_REGISTRY[type];
}

export function generateNeighborhood(latticeType: LatticeType, radius: number = 1): NeighborhoodConfig {
  return LATTICE_REGISTRY[latticeType].neighborhood(radius);
}

export function latticesForDimension(dim: 2 | 3): LatticeDefinition[] {
  return Object.values(LATTICE_REGISTRY).filter((l) => l.dimension === dim);
}

export function defaultLattice(dim: number): LatticeType {
  if (dim === 3) return 'cubic';
  return 'square';
}

export function isValidLattice(str: string): str is LatticeType {
  return str in LATTICE_REGISTRY;
}
