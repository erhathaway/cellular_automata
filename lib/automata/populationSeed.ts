const newState = (): number => Math.round(Math.random());

export type PopulationShape = Record<string, number>;
export type Population = number[] | Population[];

export const populationSeed = (shape: PopulationShape): Population => {
  const dimensions = Object.keys(shape).sort();
  const firstDimension = dimensions[0];
  const dimensionPopulation = shape[firstDimension];

  if (dimensions.length === 1) {
    return [...new Array(dimensionPopulation)].map(newState);
  }

  const newShape = { ...shape };
  delete newShape[firstDimension];
  return [...new Array(dimensionPopulation)].map(() => populationSeed(newShape));
};
