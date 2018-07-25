// cellIndex: Int
// neighborhoodArr: [Int, Int, ...]
const oneDimension = (cellIndex, neighborhoodArr) => {
  const NEIGHBORS = [
    { name: 'leftNeighbor', stateFn: (index, arr) => {
        const state = arr[index-1];
        return state === undefined ? arr.slice(-1)[0] : state;
      }
    },
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
const getBefore = (y, arr) => {
  const state = arr[y - 1];
  return state === undefined ? arr.slice(-1)[0] : state;
}

const getAfter = (y, arr) => {
  const state = arr[y + 1];
  return state === undefined ? arr[0] : state;
}

const twoDimension = (cellCoords, neighborhoodMatrix) => {
  const NEIGHBORS = [
    { name: 'top', stateFn: ({ x, y }, mat) => getBefore(y, mat)[x] },
    { name: 'topRight', stateFn: ({ x, y }, mat) => getAfter(x, getBefore(y, mat)) },
    { name: 'right', stateFn: ({ x, y }, mat) => getAfter(x, mat[y]) },
    { name: 'bottomRight', stateFn: ({ x, y }, mat) => getAfter(x, getAfter(y, mat)) },
    { name: 'bottom', stateFn: ({ x, y }, mat) => getAfter(y, mat)[x] },
    { name: 'bottomLeft', stateFn: ({ x, y }, mat) => getBefore(x, getAfter(y, mat)) },
    { name: 'left', stateFn: ({ x, y }, mat) => getBefore(x, mat[y]) },
    { name: 'topLeft', stateFn: ({ x, y }, mat) => getBefore(x, getBefore(y, mat)) },
  ];
  const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.y][cellCoords.x];
  return { neighbors, cell }
}

export { oneDimension, twoDimension }
