import { UndefinedRequiredParameter } from './errors';
import type { PopulationShape, Population } from './populationSeed';

export default class PopulationManager {
  static newState(density = 0.5): number {
    return Math.random() < density ? 1 : 0;
  }

  static seedPopulationByShape(shape: PopulationShape, density = 0.5): Population {
    if (!shape) throw new UndefinedRequiredParameter('populationShape is not defined');

    const dimensions = Object.keys(shape).sort();
    const firstDimension = dimensions[0];
    const dimensionPopulation = shape[firstDimension];

    if (dimensions.length === 1) {
      return [...new Array(dimensionPopulation)].map(() => PopulationManager.newState(density));
    }

    const newShape = { ...shape };
    delete newShape[firstDimension];
    return [...new Array(dimensionPopulation)].map(() =>
      PopulationManager.seedPopulationByShape(newShape, density)
    );
  }

  static dimensionPopulationAdjuster(
    population: any[],
    desiredSize: number,
    {
      isContainerDimension = false,
      resize,
      sizeDiff,
    }: { isContainerDimension?: boolean; resize: string; sizeDiff: number }
  ): any[] {
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

  static resizePopulation(
    currentPopulation: Population,
    desiredPopulationShape: PopulationShape
  ): Population {
    if (!currentPopulation)
      throw new UndefinedRequiredParameter('currentPopulation is not defined');
    if (!desiredPopulationShape)
      throw new UndefinedRequiredParameter('desiredPopulationShape is not defined');

    const dimensions = Object.keys(desiredPopulationShape).sort();
    const dimensionKey = dimensions[0];
    const desiredDimensionPopulationSize = desiredPopulationShape[dimensionKey];

    const sizeDiff =
      desiredDimensionPopulationSize - (currentPopulation as any[]).length;
    let resize: string;
    if (sizeDiff === 0) {
      resize = 'NONE';
    } else {
      resize = sizeDiff > 0 ? 'GROW' : 'SHRINK';
    }

    if (dimensions.length === 1) {
      return PopulationManager.dimensionPopulationAdjuster(
        currentPopulation as any[],
        desiredDimensionPopulationSize,
        { sizeDiff, resize }
      );
    }

    const adjustedDimensionPopulation = PopulationManager.dimensionPopulationAdjuster(
      currentPopulation as any[],
      desiredDimensionPopulationSize,
      { isContainerDimension: true, sizeDiff, resize }
    );

    const newShape = { ...desiredPopulationShape };
    delete newShape[dimensionKey];

    return adjustedDimensionPopulation.map((arr: Population) =>
      PopulationManager.resizePopulation(arr, newShape)
    );
  }

  static generateNextPopulationFromCurrent(
    currentPopulation: Population,
    fullPopulation: Population,
    populationShape: PopulationShape,
    computeStateOffCoordsFn: (coords: any, population: Population) => number,
    existingCoords: Record<string, number> = {}
  ): Population {
    const dimensions = Object.keys(populationShape).sort();
    const dimensionKey = dimensions[0];

    if (dimensions.length === 1) {
      return (currentPopulation as any[]).map((_cellState: number, cellPosition: number) => {
        const coords = { [dimensionKey]: cellPosition, ...existingCoords };
        return computeStateOffCoordsFn(coords, fullPopulation);
      });
    }

    const newShape = { ...populationShape };
    delete newShape[dimensionKey];

    return (currentPopulation as any[]).map((arr: Population, arrPosition: number) => {
      const newCoords = { [dimensionKey]: arrPosition, ...existingCoords };
      return PopulationManager.generateNextPopulationFromCurrent(
        arr,
        fullPopulation,
        newShape,
        computeStateOffCoordsFn,
        newCoords
      );
    });
  }

  static compressPopulation(population: Population): any {
    if (Array.isArray((population as any[])[0]))
      return (population as any[]).map(PopulationManager.compressPopulation);
    return (population as number[]).map((i) => i.toString(2)).join('');
  }
}
