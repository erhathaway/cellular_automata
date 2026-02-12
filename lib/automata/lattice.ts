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
