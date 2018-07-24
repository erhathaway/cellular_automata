// cellIndex: Int
// neighborhoodArr: [Int, Int, ...]
const oneDimension = (cellIndex, neighborhoodArr) => {
  const NEIGHBORS = [
    { name: 'leftNeighbor', stateFn: (index, arr) => {
        const state = arr[index-1];
        return state === undefined ? arr.slice(-1)[0] : state;
      }
    },
    // { name: 'cell', stateFn: (index, arr) => arr[index] },
    { name: 'rightNeighbor', stateFn: (index, arr) => {
        const state = arr[index+1];
        return state === undefined ? arr[0] : state;
      }
    },
  ];
  const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellIndex, neighborhoodArr));
  const cell = neighborhoodArr[cellIndex];
  return { neighbors, cell }
}

// cellCoords: { x: Int, y, Int }
// neighborhoodMatrix: [[Int, Int...], ...]
const twoDimension = (cellCoords, neighborhoodMatrix) => {
  const NEIGHBORS = [
    { name: 'top', stateFn: ({ x, y }, mat) => mat[y - 1][x] },
    { name: 'right', stateFn: ({ x, y }, mat) => mat[y][x + 1] },
    { name: 'bottom', stateFn: ({ x, y }, mat) => mat[y + 1][x] },
    { name: 'left', stateFn: ({ x, y }, mat) => mat[y][x - 1] },
    { name: 'cell', stateFn: ({ x, y }, mat) => mat[y][x] },
  ];
  const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellIndex, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.y][cellCoords.x];
  return { neighbors, cell }
}

export { oneDimension, twoDimension }
