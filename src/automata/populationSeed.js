const newState = () => Math.round(Math.random());

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

const newDimension = (shape) => {
  const dimensions = Object.keys(shape).sort(); // built up in terms of x, y, z etc...
  const firstDimension = dimensions[0];
  const dimensionPopulation = shape[firstDimension];

  // if only dimension left in shape, generate states
  if (dimensions.length === 1) {
    return [...new Array(dimensionPopulation)].map(newState)

  // if more dimensions left, map over those dimensions first
  } else {
    const newShape = { ...shape };
    delete newShape[firstDimension]
    return [...new Array(dimensionPopulation)].map(() => newDimension(newShape))
  }
}

export { newDimension as populationSeed  }
