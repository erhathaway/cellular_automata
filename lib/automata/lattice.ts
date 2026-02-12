export type LatticeType = 'square' | 'hexagonal' | 'triangular' | 'cubic' | 'fcc' | 'hexagonal_prism';

export interface LatticeDefinition {
  type: LatticeType;
  label: string;
  dimension: 2 | 3;
  neighborCount: number;
  offsets: [number, number][] | [number, number, number][];
  parityOffsets?: { even: [number, number][]; odd: [number, number][] };
  defaultRule: { survive: number[]; born: number[] };
  neighborStrings: string[];
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

// --- Offset definitions ---

const MOORE_8: [number, number][] = [
  [0, 1], [1, 1], [1, 0], [1, -1],
  [0, -1], [-1, -1], [-1, 0], [-1, 1],
];

const HEX_6: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1],
];

const TRI_EVEN: [number, number][] = [[-1, 0], [1, 0], [0, -1]];
const TRI_ODD: [number, number][] = [[-1, 0], [1, 0], [0, 1]];

function generateMoore26(): [number, number, number][] {
  const offsets: [number, number, number][] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        offsets.push([dx, dy, dz]);
      }
    }
  }
  return offsets;
}

function generateFCC12(): [number, number, number][] {
  const offsets: [number, number, number][] = [];
  // 12 face-diagonal neighbors: permutations of [+-1, +-1, 0]
  const axes: [number, number, number][] = [
    [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
    [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
    [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1],
  ];
  return axes;
}

function generateHexPrism20(): [number, number, number][] {
  // 6 in-plane hex neighbors + 7 above (6 hex + directly above) + 7 below
  const inPlane: [number, number, number][] = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [1, -1, 0], [-1, 1, 0],
  ];
  const above: [number, number, number][] = [
    [0, 0, 1],
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, -1, 1], [-1, 1, 1],
  ];
  const below: [number, number, number][] = [
    [0, 0, -1],
    [1, 0, -1], [-1, 0, -1], [0, 1, -1], [0, -1, -1], [1, -1, -1], [-1, 1, -1],
  ];
  return [...inPlane, ...above, ...below];
}

const MOORE_26 = generateMoore26();
const FCC_12 = generateFCC12();
const HEX_PRISM_20 = generateHexPrism20();

// --- Registry ---

export const LATTICE_REGISTRY: Record<LatticeType, LatticeDefinition> = {
  square: {
    type: 'square',
    label: 'Square',
    dimension: 2,
    neighborCount: 8,
    offsets: MOORE_8,
    defaultRule: { survive: [2, 3], born: [3] },
    neighborStrings: offsets2DToStrings(MOORE_8),
    position2D: (col, row, size) => ({ x: size * col, y: size * row }),
    geometry: 'box',
  },
  hexagonal: {
    type: 'hexagonal',
    label: 'Hex',
    dimension: 2,
    neighborCount: 6,
    offsets: HEX_6,
    defaultRule: { survive: [3, 4], born: [2] },
    neighborStrings: offsets2DToStrings(HEX_6),
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
    neighborCount: 3,
    offsets: TRI_EVEN, // default; parity-dependent in practice
    parityOffsets: { even: TRI_EVEN, odd: TRI_ODD },
    defaultRule: { survive: [1, 2], born: [1] },
    neighborStrings: offsets2DToStrings(TRI_EVEN),
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
    offsets: MOORE_26,
    defaultRule: { survive: [4, 5], born: [5] },
    neighborStrings: offsets3DToStrings(MOORE_26),
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
    offsets: FCC_12,
    defaultRule: { survive: [3, 4], born: [4] },
    neighborStrings: offsets3DToStrings(FCC_12),
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
    offsets: HEX_PRISM_20,
    defaultRule: { survive: [5, 6, 7], born: [5] },
    neighborStrings: offsets3DToStrings(HEX_PRISM_20),
    position3D: (x, y, z, size) => ({
      px: size * (SQRT3 * x + (SQRT3 / 2) * y),
      py: size * z,
      pz: size * 1.5 * y,
    }),
    geometry: 'hexprism',
  },
};

// --- Neighborhood generation at arbitrary radius ---

export interface NeighborhoodConfig {
  offsets2D?: [number, number][];
  offsets3D?: [number, number, number][];
  parityOffsets?: { even: [number, number][]; odd: [number, number][] };
  neighborStrings: string[];
  neighborCount: number;
}

function generateSquareNeighborhood(radius: number): NeighborhoodConfig {
  const offsets: [number, number][] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      offsets.push([dx, dy]);
    }
  }
  return { offsets2D: offsets, neighborStrings: offsets2DToStrings(offsets), neighborCount: offsets.length };
}

function generateHexNeighborhood(radius: number): NeighborhoodConfig {
  const offsets: [number, number][] = [];
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = -radius; dr <= radius; dr++) {
      if (dq === 0 && dr === 0) continue;
      // Hex distance in axial coords: max(|dq|, |dr|, |dq+dr|)
      if (Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= radius) {
        offsets.push([dq, dr]);
      }
    }
  }
  return { offsets2D: offsets, neighborStrings: offsets2DToStrings(offsets), neighborCount: offsets.length };
}

function bfsTriOffsets(radius: number, originEven: boolean): [number, number][] {
  const visited = new Set<string>();
  visited.add('0,0');
  let frontier: [number, number][] = [[0, 0]];

  for (let step = 0; step < radius; step++) {
    const nextFrontier: [number, number][] = [];
    for (const [x, y] of frontier) {
      // Determine if this cell uses TRI_EVEN or TRI_ODD offsets
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
    const [x, y] = key.split(',').map(Number);
    result.push([x, y]);
  }
  return result;
}

function generateTriNeighborhood(radius: number): NeighborhoodConfig {
  const evenOffsets = bfsTriOffsets(radius, true);
  const oddOffsets = bfsTriOffsets(radius, false);
  return {
    offsets2D: evenOffsets,
    parityOffsets: { even: evenOffsets, odd: oddOffsets },
    neighborStrings: offsets2DToStrings(evenOffsets),
    neighborCount: evenOffsets.length,
  };
}

function generateCubicNeighborhood(radius: number): NeighborhoodConfig {
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
}

function bfs3DOffsets(baseOffsets: [number, number, number][], radius: number): [number, number, number][] {
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

  const result: [number, number, number][] = [];
  for (const key of visited) {
    if (key === '0,0,0') continue;
    const [x, y, z] = key.split(',').map(Number);
    result.push([x, y, z]);
  }
  return result;
}

function generateFCCNeighborhood(radius: number): NeighborhoodConfig {
  const offsets = bfs3DOffsets(FCC_12, radius);
  return { offsets3D: offsets, neighborStrings: offsets3DToStrings(offsets), neighborCount: offsets.length };
}

function generateHexPrismNeighborhood(radius: number): NeighborhoodConfig {
  const offsets = bfs3DOffsets(HEX_PRISM_20, radius);
  return { offsets3D: offsets, neighborStrings: offsets3DToStrings(offsets), neighborCount: offsets.length };
}

export function generateNeighborhood(latticeType: LatticeType, radius: number = 1): NeighborhoodConfig {
  switch (latticeType) {
    case 'square': return generateSquareNeighborhood(radius);
    case 'hexagonal': return generateHexNeighborhood(radius);
    case 'triangular': return generateTriNeighborhood(radius);
    case 'cubic': return generateCubicNeighborhood(radius);
    case 'fcc': return generateFCCNeighborhood(radius);
    case 'hexagonal_prism': return generateHexPrismNeighborhood(radius);
  }
}

// --- Helpers ---

export function getLattice(type: LatticeType): LatticeDefinition {
  return LATTICE_REGISTRY[type];
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
