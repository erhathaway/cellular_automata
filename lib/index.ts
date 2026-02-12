export { default as AutomataManager } from './automata/index';
export { default as PopulationManager } from './automata/populationManager';
export { populationSeed } from './automata/populationSeed';
export type { PopulationShape, Population } from './automata/populationSeed';
export {
  oneDimension as oneDimensionNeighborhoodExtractor,
  twoDimension as twoDimensionNeighborhoodExtractor,
  threeDimension as threeDimensionNeighborhoodExtractor,
  generateMooreNeighbors1D,
  generateMooreNeighbors2D,
  generateMooreNeighbors3D,
} from './automata/neighborhoodStateExtractor';
export {
  oneDimension as oneDimensionStateReducer,
  lifeLike as lifeLikeStateReducer,
} from './automata/stateReducer';
export { OneDimension as OneDimensionRuleApplicator, LifeLike as LifeLikeRuleApplicator } from './automata/ruleApplicator';
export type { LifeLikeRule } from './automata/ruleApplicator';

export {
  getLattice,
  generateNeighborhood,
  latticesForDimension,
  defaultLattice,
  isValidLattice,
  LATTICE_REGISTRY,
} from './automata/lattice';
export type { LatticeType, LatticeDefinition, NeighborhoodConfig, ShapeInfo, GeometryType } from './automata/lattice';

export { default as BaseViewer } from './viewer/base/index';
export type { HSLColor, CellState, ViewerConstructorOptions } from './viewer/base/index';
export { default as OneDimensionInTwoDimensions } from './viewer/OneDimensionInTwoDimensions';
export { default as TwoDimensionInTwoDimensions } from './viewer/TwoDimensionInTwoDimensions';
export { default as TwoDimensionInThreeDimensions } from './viewer/TwoDimensionInThreeDimensions';
export { default as ThreeDimensionInThreeDimensions } from './viewer/ThreeDimensionInThreeDimensions';
