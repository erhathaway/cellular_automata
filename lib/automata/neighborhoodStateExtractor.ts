import { ErrorCreatingCoordinateExtractor } from './errors';

type ExtractorFn = (i: number, arr: any) => any;
type CoordinateExtractor = (coords: { x: number; y?: number; z?: number }, arr: any) => any;

const before =
  (mag: number): ExtractorFn =>
  (i, arr) => arr[((i - mag) % arr.length + arr.length) % arr.length];

const after =
  (mag: number): ExtractorFn =>
  (i, arr) => arr[(i + mag) % arr.length];

const same: ExtractorFn = (i, arr) => arr[i];

export const createCoordinateExtractors = (serializedCoordinates: string[]): CoordinateExtractor[] => {
  return serializedCoordinates.map((coordinate) => {
    const dimensions = coordinate.split('|');
    const coordinateExtractors: ExtractorFn[] = dimensions.map((d) => {
      if (d.includes('+')) {
        const index = d.indexOf('+');
        const magnitude = +d.slice(index + 1);
        return after(magnitude);
      }
      if (d.includes('-')) {
        const index = d.indexOf('-');
        const magnitude = +d.slice(index + 1);
        return before(magnitude);
      }
      return same;
    });

    if (coordinateExtractors.length === 1) {
      return ({ x }: { x: number }, arr: any) => coordinateExtractors[0](x, arr);
    }
    if (coordinateExtractors.length === 2) {
      return ({ x, y }: { x: number; y?: number }, arr: any) =>
        coordinateExtractors[1](y!, coordinateExtractors[0](x, arr));
    }
    if (coordinateExtractors.length === 3) {
      return ({ x, y, z }: { x: number; y?: number; z?: number }, arr: any) =>
        coordinateExtractors[2](z!, coordinateExtractors[1](y!, coordinateExtractors[0](x, arr)));
    }
    return () => {
      throw new ErrorCreatingCoordinateExtractor();
    };
  });
};

// 1D
const twoNeighboorsOneDimension = createCoordinateExtractors(['x-1', 'x+1']);
// 2D
const eightNeighboorsTwoDimensions = createCoordinateExtractors([
  'x|y+1',
  'x+1|y+1',
  'x+1|y',
  'x+1|y-1',
  'x|y-1',
  'x-1|y-1',
  'x-1|y',
  'x-1|y+1',
]);
// 3D
const twentySixNeighboorsThreeDimensions = createCoordinateExtractors([
  'x|y+1|z',
  'x+1|y+1|z',
  'x+1|y|z',
  'x+1|y-1|z',
  'x|y-1|z',
  'x-1|y-1|z',
  'x-1|y|z',
  'x-1|y+1|z',
  'x|y+1|z+1',
  'x+1|y+1|z+1',
  'x+1|y|z+1',
  'x+1|y-1|z+1',
  'x|y-1|z+1',
  'x-1|y-1|z+1',
  'x-1|y|z+1',
  'x-1|y+1|z+1',
  'x|y|z+1',
  'x|y+1|z-1',
  'x+1|y+1|z-1',
  'x+1|y|z-1',
  'x+1|y-1|z-1',
  'x|y-1|z-1',
  'x-1|y-1|z-1',
  'x-1|y|z-1',
  'x-1|y+1|z-1',
  'x|y|z-1',
]);

// --- Dynamic Moore neighborhood generators ---

function coordPart(axis: string, delta: number): string {
  if (delta === 0) return axis;
  return delta > 0 ? `${axis}+${delta}` : `${axis}${delta}`;
}

export function generateMooreNeighbors1D(radius: number): string[] {
  const neighbors: string[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    if (dx === 0) continue;
    neighbors.push(coordPart('x', dx));
  }
  return neighbors;
}

export function generateMooreNeighbors2D(radius: number): string[] {
  const neighbors: string[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      neighbors.push(`${coordPart('x', dx)}|${coordPart('y', dy)}`);
    }
  }
  return neighbors;
}

export function generateMooreNeighbors3D(radius: number): string[] {
  const neighbors: string[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        neighbors.push(`${coordPart('x', dx)}|${coordPart('y', dy)}|${coordPart('z', dz)}`);
      }
    }
  }
  return neighbors;
}

export interface NeighborhoodResult {
  neighbors: number[];
  cell: number;
}

export const oneDimension = (
  cellCoords: { x: number },
  neighborhoodArr: number[]
): NeighborhoodResult => {
  const neighbors = twoNeighboorsOneDimension.map((fn) => fn(cellCoords, neighborhoodArr));
  const cell = neighborhoodArr[cellCoords.x];
  return { neighbors, cell };
};

export const twoDimension = (
  cellCoords: { x: number; y: number },
  neighborhoodMatrix: number[][]
): NeighborhoodResult => {
  const neighbors = eightNeighboorsTwoDimensions.map((fn) => fn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.x][cellCoords.y];
  return { neighbors, cell };
};

export const threeDimension = (
  cellCoords: { x: number; y: number; z: number },
  neighborhoodMatrix: number[][][]
): NeighborhoodResult => {
  const neighbors = twentySixNeighboorsThreeDimensions.map((fn) =>
    fn(cellCoords, neighborhoodMatrix)
  );
  const cell = neighborhoodMatrix[cellCoords.x][cellCoords.y][cellCoords.z];
  return { neighbors, cell };
};
