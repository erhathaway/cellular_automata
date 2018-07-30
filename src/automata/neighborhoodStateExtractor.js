

// cellCoords: { x: Int, y, Int }
// neighborhoodMatrix: [[Int, Int...], ...]
// const getBefore = (i, arr) => {
//   const state = arr[i - 1];
//   return state === undefined ? arr.slice(-1)[0] : state;
// }
//
// const getAfter = (i, arr) => {
//   const state = arr[i + 1];
//   return state === undefined ? arr[0] : state;
// }

/* coordinate system
┌─────────────────────────────┐
│ ┌─────┐                     │
│ │┌───┐│                     │
│ ││ z ││                     │
│ │└───┘│                     │
│ │     │                     │
│ │  y  │             x       │
│ └─────┘                     │
└─────────────────────────────┘
*/

const before = (mag) => (i, arr) => {
  const state = arr[i - mag];
  return state === undefined ? arr.slice(-1)[0] : state;
}

const after = (mag) => (i, arr) => {
  const state = arr[i + mag];
  return state === undefined ? arr[0] : state;
}

const same = (i, arr) => {
  return arr[i]
}

/*
  serializedCoordinates should be a string in the form 'x|y+1', 'x+1|y', 'x-1|y|z-1', 'x|y|z+2', 'x-3|y|z', etc...
  The coordinate string can specify three dimensions (x, y, z).
  The dimensions must be written in terms of 'x', 'y', or 'z'
  The relative direction should be represented by a plus or minus sign: '+' or '-'
  The distance from the origin cell can be any integer, for example 'x+3' means the coordinate is 3 cells after the current one
*/
const createCoordinateExtractors = (serializedCoordinates) => {
  return serializedCoordinates.map(coordinate => {
    const dimensions = coordinate.split('|')
    const coordinateExtractors = dimensions.map(d => {
      if (d.includes('+')) {
        const index = d.indexOf('+')
        const magnitude = +d.slice(index+1)
        return after(magnitude)
      } else if (d.includes('-')) {
        const index = d.indexOf('-')
        const magnitude = +d.slice(index+1)
        return before(magnitude)
      } else {
        return same;
      }
    })

    if (coordinateExtractors.length === 1) {
      return ({x}, arr) => {
        return coordinateExtractors[0](x, arr)
      }
    } else if (coordinateExtractors.length === 2) {
      return ({x, y}, arr) => {
        return coordinateExtractors[1](y, coordinateExtractors[0](x, arr))
      }
    } else if (coordinateExtractors.length === 3) {
      return ({x, y, z}, arr) => {
        return coordinateExtractors[2](z, coordinateExtractors[1](y, coordinateExtractors[0](x, arr)))
      }
    }
  })
}

// 1D
const twoNeighboorsOneDimension = createCoordinateExtractors(['x-1', 'x+1']);
// 2D
const fourNeighboorsTwoDimensions = createCoordinateExtractors(['x|y+1', 'x+1|y', 'x|y-1', 'x-1|y']);
const eightNeighboorsTwoDimensions = createCoordinateExtractors(['x|y+1', 'x+1|y+1', 'x+1|y', 'x+1|y-1', 'x|y-1', 'x-1|y-1', 'x-1|y', 'x-1|y+1']);
const twentyFourNeighboorsTwoDimensions = createCoordinateExtractors([
  // 'x-2|y+1',
  // 'x-2|y-1',
  // 'x-2|y-2',
  // 'x-2|y',
  // 'x-2|y+2',
  'x+2|y+2',
  'x+2|y+1',
  'x+2|y',
  'x+2|y-1',
  'x+2|y-2',
  // 'x-1|y+2', 'x|y+2', 'x+1|y+2',
  // 'x-1|y-2', 'x|y-2', 'x+1|y-2',
  'x|y+1', 'x+1|y+1', 'x+1|y', 'x+1|y-1', 'x|y-1', 'x-1|y-1', 'x-1|y', 'x-1|y+1'
]);
// 3D
const sixNeighboorsThreeDimensions = createCoordinateExtractors(['x|y+1|z', 'x+1|y|z', 'x|y-1|z', 'x-1|y|z', 'x|y|z+1', 'x|y|z-1']);
const twentySixNeighboorsThreeDimensions = createCoordinateExtractors([
  'x|y+1|z', 'x+1|y+1|z', 'x+1|y|z', 'x+1|y-1|z', 'x|y-1|z', 'x-1|y-1|z', 'x-1|y|z', 'x-1|y+1|z',
  'x|y+1|z+1', 'x+1|y+1|z+1', 'x+1|y|z+1', 'x+1|y-1|z+1', 'x|y-1|z+1', 'x-1|y-1|z+1', 'x-1|y|z+1', 'x-1|y+1|z+1', 'x|y|z+1',
  'x|y+1|z-1', 'x+1|y+1|z-1', 'x+1|y|z-1', 'x+1|y-1|z-1', 'x|y-1|z-1', 'x-1|y-1|z-1', 'x-1|y|z-1', 'x-1|y+1|z-1', 'x|y|z-1',
])



// cellCoords: { x: Int }
// neighborhoodArr: [Int, Int, ...]
const oneDimension = (cellCoords, neighborhoodArr) => {
  const neighbors = twoNeighboorsOneDimension.map(fn => fn(cellCoords, neighborhoodArr))
  const cell = neighborhoodArr[cellCoords.x];
  return { neighbors, cell }
}

const twoDimension = (cellCoords, neighborhoodMatrix) => {
  const neighbors = eightNeighboorsTwoDimensions.map(fn => fn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.x][cellCoords.y];
  return { neighbors, cell }
}

const threeDimension = (cellCoords, neighborhoodMatrix) => {
  const neighbors = twentySixNeighboorsThreeDimensions.map(fn => fn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.x][cellCoords.y][cellCoords.z];
  return { neighbors, cell }
}

export { oneDimension, twoDimension, threeDimension }
