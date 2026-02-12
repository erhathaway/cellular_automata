export type LatticeType = 'square' | 'hexagonal' | 'triangular' | 'cubic' | 'fcc' | 'hexagonal_prism';

export interface NeighborhoodConfig {
  offsets2D?: [number, number][];
  offsets3D?: [number, number, number][];
  parityOffsets?: { even: [number, number][]; odd: [number, number][] };
  neighborStrings: string[];
  neighborCount: number;
}

export interface LatticeDefinition {
  type: LatticeType;
  label: string;
  dimension: 2 | 3;
  neighborCount: number;                         // r=1 neighbor count (for UI display)
  defaultRule: { survive: number[]; born: number[] };
  neighborhood: (radius: number) => NeighborhoodConfig;  // per-lattice, per-shape, per-radius
  position2D?: (col: number, row: number, size: number) => { x: number; y: number };
  position3D?: (x: number, y: number, z: number, size: number) => { px: number; py: number; pz: number };
  geometry: 'box' | 'hexprism' | 'triprism' | 'sphere';
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

// --- Base offset definitions ---

// Triangular "Moore" neighborhood: edge + vertex sharing (6 neighbors at r=1)
// Up triangles (even parity) and down triangles (odd parity) have different offsets
const TRI_EVEN: [number, number][] = [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [0, 1]];
const TRI_ODD: [number, number][] = [[-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1], [0, -1]];

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
    // Moore neighborhood: all cells within Chebyshev distance r
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
    // Axial distance: all cells where max(|dq|, |dr|, |dq+dr|) <= r
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
    // BFS with parity-dependent offsets: up triangles (even) and down triangles (odd)
    // have different neighbor sets at each position
    neighborhood(radius) {
      function bfsTri(originEven: boolean): [number, number][] {
        const visited = new Set<string>();
        visited.add('0,0');
        let frontier: [number, number][] = [[0, 0]];

        for (let step = 0; step < radius; step++) {
          const nextFrontier: [number, number][] = [];
          for (const [x, y] of frontier) {
            const useEven = originEven ? (x + y) % 2 === 0 : (x + y) % 2 !== 0;
            const offsets = useEven ? TRI_EVEN : TRI_ODD;
            for (const [dx, dy] of offsets) {
              const nx = x + dx;
              const ny = y + dy;
              const key = `${nx},${ny}`;
              if (!visited.has(key)) {
                visited.add(key);
                nextFrontier.push([nx, ny]);
              }
            }
          }
          frontier = nextFrontier;
        }

        const result: [number, number][] = [];
        for (const key of visited) {
          if (key === '0,0') continue;
          const [cx, cy] = key.split(',').map(Number);
          result.push([cx, cy]);
        }
        return result;
      }

      const evenOffsets = bfsTri(true);
      const oddOffsets = bfsTri(false);
      return {
        offsets2D: evenOffsets,
        parityOffsets: { even: evenOffsets, odd: oddOffsets },
        neighborStrings: offsets2DToStrings(evenOffsets),
        neighborCount: evenOffsets.length,
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
    geometry: 'triprism',
  },
  cubic: {
    type: 'cubic',
    label: 'Cubic',
    dimension: 3,
    neighborCount: 26,
    defaultRule: { survive: [4, 5], born: [5] },
    // Moore 3D: all cells within Chebyshev distance r
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
    // BFS with 12 face-diagonal base offsets
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
    // BFS with 20 hex prism base offsets
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
