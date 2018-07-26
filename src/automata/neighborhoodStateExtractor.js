

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
        return coordinateExtractors[0](x, coordinateExtractors[1](y, arr))
      }
    } else if (coordinateExtractors.length === 3) {
      return ({x, y, z}, arr) => {
        return coordinateExtractors[0](x, coordinateExtractors[1](y, coordinateExtractors[2](z, arr)))
      }
    }
  })
}

// 1D
const twoNeighboorsOneDimension = createCoordinateExtractors(['x-1', 'x+1']);
// 2D
const fourNeighboorsTwoDimensions = createCoordinateExtractors(['x|y+1', 'x+1|y', 'x|y-1', 'x-1|y']);
const eightNeighboorsTwoDimensions = createCoordinateExtractors(['x|y+1', 'x+1|y+1', 'x+1|y', 'x+1|y-1', 'x|y-1', 'x-1|y-1', 'x-1|y', 'x-1|y+1']);
// 3D
const sixNeighboorsThreeDimensions = createCoordinateExtractors(['x|y+1|z', 'x+1|y|z', 'x|y-1|z', 'x-1|y|z', 'x|y|z+1', 'x|y|z-1']);
const twentySixNeighboorsThreeDimensions = createCoordinateExtractors([
  'x|y+1|z', 'x+1|y+1|z', 'x+1|y|z', 'x+1|y-1|z', 'x|y-1|z', 'x-1|y-1|z', 'x-1|y|z', 'x-1|y+1|z',
  'x|y+1|z+1', 'x+1|y+1|z+1', 'x+1|y|z+1', 'x+1|y-1|z+1', 'x|y-1|z+1', 'x-1|y-1|z+1', 'x-1|y|z+1', 'x-1|y+1|z+1', 'x|y|z+1',
  'x|y+1|z-1', 'x+1|y+1|z-1', 'x+1|y|z-1', 'x+1|y-1|z-1', 'x|y-1|z-1', 'x-1|y-1|z-1', 'x-1|y|z-1', 'x-1|y+1|z-1', 'x|y|z-1',
])



// cellIndex: Int
// neighborhoodArr: [Int, Int, ...]
const oneDimension = (cellIndex, neighborhoodArr) => {
  // const NEIGHBORS = [
  //   { name: 'leftNeighbor', stateFn: (index, arr) => {
  //       const state = arr[index-1];
  //       return state === undefined ? arr.slice(-1)[0] : state;
  //     }
  //   },
  //   { name: 'rightNeighbor', stateFn: (index, arr) => {
  //       const state = arr[index+1];
  //       return state === undefined ? arr[0] : state;
  //     }
  //   },
  // ];
  // const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellIndex, neighborhoodArr));
  const neighbors = twoNeighboorsOneDimension.map(fn => fn({ x: cellIndex }, neighborhoodArr))
  const cell = neighborhoodArr[cellIndex];
  return { neighbors, cell }
}

const twoDimension = (cellCoords, neighborhoodMatrix) => {
  // const NEIGHBORS = [
  //   { name: 'top', stateFn: ({ x, y }, mat) => getBefore(y, mat)[x] },
  //   { name: 'topRight', stateFn: ({ x, y }, mat) => getAfter(x, getBefore(y, mat)) },
  //   { name: 'right', stateFn: ({ x, y }, mat) => getAfter(x, mat[y]) },
  //   { name: 'bottomRight', stateFn: ({ x, y }, mat) => getAfter(x, getAfter(y, mat)) },
  //   { name: 'bottom', stateFn: ({ x, y }, mat) => getAfter(y, mat)[x] },
  //   { name: 'bottomLeft', stateFn: ({ x, y }, mat) => getBefore(x, getAfter(y, mat)) },
  //   { name: 'left', stateFn: ({ x, y }, mat) => getBefore(x, mat[y]) },
  //   { name: 'topLeft', stateFn: ({ x, y }, mat) => getBefore(x, getBefore(y, mat)) },
  // ];
  // const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellCoords, neighborhoodMatrix));
  // console.log(eightNeighboorsTwoDimensions)

  const neighbors = eightNeighboorsTwoDimensions.map(fn => fn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.y][cellCoords.x];
  return { neighbors, cell }
}

export { oneDimension, twoDimension }
