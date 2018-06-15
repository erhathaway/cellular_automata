const NEIGHBORS = [
  { name: 'leftNeighboor', value: (index, arr) => arr[index-1], bitShift: value => value << 2 },
  { name: 'cell', value: (index, arr) => arr[index], bitShift: value => value << 1 },
  { name: 'rightNeighboor', value: (index, arr) => arr[index+1], bitShift: value => value },
];


const nextGeneration = (currentGeneration, ruleObject) =>
  currentGeneration.map((val, index, arr) => {
    const neighborhoodState = NEIGHBORS.reduce((acc, { value, bitShift }) => {
      const v = value(index, arr);
      return acc | bitShift(v);
    }, 0);
    return ruleObject[neighborhoodState];
  });

export default nextGeneration;
// const testGeneration = [0,1,1,1,1,1,0,0,0,0];
// const r = ruleObject(110)
//
// nextGeneration(testGeneration, r)
