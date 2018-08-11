const oneDimension = ({ neighbors, cell }) => {
  const left = neighbors[0] << 2; // eslint-disable-line no-bitwise
  const self = cell << 1; // eslint-disable-line no-bitwise
  const right = neighbors[1];
  const ruleKey = left | self | right; // eslint-disable-line no-bitwise
  return { ruleKey };
};

const twoDimension = ({ neighbors, cell }) => {
  const sumNeighborRule = neighbors.reduce((acc, state, index) => {
    return acc | state << index; // eslint-disable-line no-bitwise, no-mixed-operators
  }, 0);
  const ruleKey = sumNeighborRule | cell << neighbors.length; // eslint-disable-line no-bitwise, no-mixed-operators, max-len
  return { ruleKey };
};

const lifeLike = ({ neighbors, cell }) => {
  const neighborStatesCount = neighbors.reduce((acc, state) => {
    const existingCount = acc[state] || 0;
    acc[state] = existingCount + 1;
    return acc;
  }, {});
  return { neighborStatesCount, cellState: cell };
};

export { oneDimension, twoDimension, lifeLike };
