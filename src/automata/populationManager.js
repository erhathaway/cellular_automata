import { UndefinedRequiredParameter } from './errors';

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

class PopulationManager {
  /*------------------------*/
  /* SEEDING */
  /*------------------------*/

  static newState() { return Math.round(Math.random()); }

  static seedPopulationByShape(shape) {
    if (!shape) throw new UndefinedRequiredParameter('populationShape is not defined');

    // built up in terms of x, y, z etc...
    const dimensions = Object.keys(shape).sort();
    const firstDimension = dimensions[0];
    const dimensionPopulation = shape[firstDimension];

    // if only dimension left in populationShape, generate states
    if (dimensions.length === 1) {
      return [...new Array(dimensionPopulation)].map(PopulationManager.newState);
    }
    // if more dimensions left, map over those dimensions first
    const newShape = { ...shape };
    delete newShape[firstDimension];
    return [...new Array(dimensionPopulation)]
      .map(() => PopulationManager.seedPopulationByShape(newShape));
  }

  /*------------------------*/
  /* RESIZING */
  /*------------------------*/

  // resizes a population along one dimension
  static dimensionPopulationAdjuster(population, desiredSize, { isContainerDimension, resize, sizeDiff } = { isContainerDimension: false }) { // eslint-disable-line max-len
    switch (resize) {
      case 'GROW': {
        const fillType = isContainerDimension ? [] : 0;
        const filler = new Array(sizeDiff).fill(fillType);
        return [...population, ...filler];
      }
      case 'SHRINK':
        return population.slice(0, desiredSize);
      default:
        return population;
    }
  }

  // resizes a multidimensional population
  static resizePopulation(currentPopulation, desiredPopulationShape) {
    if (!currentPopulation) throw new UndefinedRequiredParameter('currentPopulation is not defined');
    if (!desiredPopulationShape) throw new UndefinedRequiredParameter('desiredPopulationShape is not defined');

    // figure out which dimension (x, y, z, etc...) of the population this is based on
    // for the desired populationShape
    // Note: the population is built up in terms of x, y, z etc...
    const dimensions = Object.keys(desiredPopulationShape).sort();
    const dimensionKey = dimensions[0];
    const desiredDimensionPopulationSize = desiredPopulationShape[dimensionKey];

    // figure out how to resize this dimension of the population
    const sizeDiff = desiredDimensionPopulationSize - currentPopulation.length;
    let resize;
    if (sizeDiff === 0) {
      resize = 'NONE';
    } else {
      resize = sizeDiff > 0 ? 'GROW' : 'SHRINK';
    }
    // if only dimension left in shape, generate states
    if (dimensions.length === 1) {
      // resize population along this dimension
      return PopulationManager.dimensionPopulationAdjuster(
        currentPopulation, desiredDimensionPopulationSize, { sizeDiff, resize },
      );
    }

    // if other dimensions still exist, recursively call this function
    // resize population along this dimension
    const adjustedDimensionPopulation = PopulationManager.dimensionPopulationAdjuster(
      currentPopulation,
      desiredDimensionPopulationSize,
      { isContainerDimension: true, sizeDiff, resize },
    );

    // remove the current dimension
    const newShape = { ...desiredPopulationShape };
    delete newShape[dimensionKey];

    // for the next dimension, recursively call this function
    return adjustedDimensionPopulation.map(arr => PopulationManager.resizePopulation(arr, newShape)); // eslint-disable-line max-len
  }


  /*------------------------*/
  /* NEXT POPULATION GENERATION */
  /*------------------------*/
  static generateNextPopulationFromCurrent(currentPopulation, fullPopulation, populationShape, computeStateOffCoordsFn, existingCoords = {}) { // eslint-disable-line max-len
    const dimensions = Object.keys(populationShape).sort(); // built up in terms of x, y, z etc...
    const dimensionKey = dimensions[0];

    // if only dimension left in shape, generate states
    if (dimensions.length === 1) {
      return currentPopulation.map((cellState, cellPosition) => {
        const coords = { [dimensionKey]: cellPosition, ...existingCoords };
        return computeStateOffCoordsFn(coords, fullPopulation);
      });
    // other dimensions, recursively call this function
    }

    const newShape = { ...populationShape };
    delete newShape[dimensionKey];

    return currentPopulation.map((arr, arrPosition) => {
      const newCoords = { [dimensionKey]: arrPosition, ...existingCoords };
      return PopulationManager.generateNextPopulationFromCurrent(arr, fullPopulation, newShape, computeStateOffCoordsFn, newCoords); // eslint-disable-line max-len
    });
  }
}

export default PopulationManager;
