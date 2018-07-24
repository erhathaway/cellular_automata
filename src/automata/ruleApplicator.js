// a simple 1D cellular automata program has two states (0, 1) and three cells ( 2 neighbors and itself)
const oneDimension = (rule = 110, { states, cells } = { states: 2, cells: 3 }) => {
  const neighborhoodRule = (ruleNumber, neighborhood) => {
    /* example:
      If rule = 110 and neighborhood = 7 (seven being the largest index - since there are 8 total),
      we want to mask the 6 earlier neighborhoods and
      see if the remaining neighborhood rule in 110 is >1 or = 0 (indicating rule)
    */
    const mask = states ** neighborhood;
    return (ruleNumber & mask) === 0 ? 0 : 1; // represent the two rule states for a neighborhood
  };

  const ruleObject = (ruleNumber) => {
    /* returns an object
      the keys are the neighborhood index
      the value is a state (1 or 0)
    */
    const neighborhoodVarieties = [...Array(cells ** states).keys()]; // [0,1,2,3,4,5,6,7] the eight possible neighborhoods
    return neighborhoodVarieties.reduce(
      (acc, state) => {
        acc[state] = neighborhoodRule(ruleNumber, state);
        return acc;
      },
    {});
  }
  return (reducedNeighborhoodState) => ruleObject(rule)[reducedNeighborhoodState]
}

const lifeLike = ({ survive, born } = { survive: [2, 3], born: [3] }) => (neighborStates, cellState) => {
  if (cellState === 1) && survive.includes(neighborStates[1])) return 1;
  else if (cellState === 0 && born.includes(neighborStates[1])) return 1;
  else return 0;
}

export { oneDimension }
