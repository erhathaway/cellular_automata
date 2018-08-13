import { types, addMiddleware } from 'mobx-state-tree';

import { Dimension, DimensionInstance } from './Dimension';
import { CellStates, CellStatesInstance } from './CellStates';
import { Neighbors, NeighborsInstance } from './Neighbors';
import { PopulationShape, PopulationShapeInstance } from './PopulationShape';
import { Viewer, ViewerInstance } from './Viewer';

const dimensionDependencies = [
  PopulationShapeInstance.onDimensionChange,
  ViewerInstance.onDimensionChange,
  NeighborsInstance.onDimensionChange,
];

addMiddleware(DimensionInstance, (call, next) => {
  const newDimensionValue = call.args;
  next(call);
  dimensionDependencies.forEach(fn => fn(newDimensionValue));
});

/* -----------------------------------------------------------------------------
Root Store
----------------------------------------------------------------------------- */

const AutomataStore = types
  .model('automataStore', {
    dimension: Dimension,
    viewer: Viewer,
    cellStates: CellStates,
    populationShape: PopulationShape,
    neighbors: Neighbors,
  })
  .create({
    dimension: DimensionInstance,
    viewer: ViewerInstance,
    cellStates: CellStatesInstance,
    populationShape: PopulationShapeInstance,
    neighbors: NeighborsInstance,
  });

export default AutomataStore;
