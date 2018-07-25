const oneDimension = ({ neighbors, cell }) => {
  const left = neighbors[0] << 2;
  const self = cell << 1;
  const right = neighbors[1];
  const count = left | self | right;
  return count;
}

const twoDimension = ({ neighbors, cell }) => {
  const sumNeighborRule = neighbors.reduce((acc, state, index) => {
    return acc | state << index;
  }, 0)
  return sumNeighborRule | cell << neighbors.length;
}

const lifeLike = ({ neighbors, cell }) => {
  const neighborsStateCount = neighbors.reduce((acc, state) => {
    const existingCount = acc[state] || 0;
    acc[state] = existingCount + 1;
    return acc;
  }, {});
  return { neighborsState: neighborsStateCount, cellState: cell };
}

export { oneDimension, twoDimension, lifeLike }
