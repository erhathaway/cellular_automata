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
    { name: 'top', stateFn: ({ x, y }, mat) => {
        const state = mat[y - 1];
        return state === undefined ? mat.slice(-1)[0][x] : state[x];
      }
    },
    { name: 'right', stateFn: ({ x, y }, mat) => {
        const state = mat[y][x + 1];
        return state === undefined ? mat[y][0] : state;
      }
    },
    { name: 'bottom', stateFn: ({ x, y }, mat) => {
        const state = mat[y + 1];
        return state === undefined ? mat[0][x] : state[x];
      }
    },
    { name: 'left', stateFn: ({ x, y }, mat) => {
        const state = mat[y][x - 1];
        return state === undefined ? mat[y].slice(-1)[0] : state;
      }
    },
  ];
  const neighbors = NEIGHBORS.map(({ stateFn }) => stateFn(cellCoords, neighborhoodMatrix));
  const cell = neighborhoodMatrix[cellCoords.y][cellCoords.x];
  return { neighbors, cell }
}

export { oneDimension, twoDimension }
