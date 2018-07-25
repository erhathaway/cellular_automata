const newState = () => Math.round(Math.random());

const newDimension = (shape) => {
  const dimensions = Object.keys(shape);
  const firstDimension = dimensions[0];
  const dimensionPopulation = shape[firstDimension];

  // if only dimension left in shape, generate states
  if (dimensions.length === 1) {
    return [...new Array(shape[firstDimension])].map(newState)
  // if more dimensions left, map over those dimensions first
  } else {
    const newShape = shape;
    delete newShape[firstDimension]
    return [...new Array(dimensionPopulation)].map(() => newDimension(newShape))
  }
}

export { newDimension as populationSeed  }
