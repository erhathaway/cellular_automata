const oneDimension = ({ neighbors, cell }) => {
  const left = neighbors[0] << 2;
  const self = cell << 1;
  const right = neighbors[1];
  const ruleKey = left | self | right;
  return { ruleKey };
}

const twoDimension = ({ neighbors, cell }) => {
  const sumNeighborRule = neighbors.reduce((acc, state, index) => {
    return acc | state << index;
  }, 0)
  const ruleKey =  sumNeighborRule | cell << neighbors.length;
  return { ruleKey }
}

const lifeLike = ({ neighbors, cell }) => {
  const neighborStatesCount = neighbors.reduce((acc, state) => {
    const existingCount = acc[state] || 0;
    acc[state] = existingCount + 1;
    return acc;
  }, {});
  return { neighborStatesCount, cellState: cell };
}

export { oneDimension, twoDimension, lifeLike }
