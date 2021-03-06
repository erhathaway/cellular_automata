import { types, addMiddleware } from 'mobx-state-tree';

import { Dimension, DimensionInstance } from './Dimension';
import { CellStates, CellStatesInstance } from './CellStates';
import { Neighbors, NeighborsInstance } from './Neighbors';
import { PopulationShape, PopulationShapeInstance } from './PopulationShape';
import { Viewer, ViewerInstance } from './Viewer';
import { Rule, RuleInstance } from './Rule';

const dimensionDependencies = [
  PopulationShapeInstance.onDimensionChange,
  ViewerInstance.onDimensionChange,
  NeighborsInstance.onDimensionChange,
  RuleInstance.onDimensionChange,
  CellStatesInstance.onDimensionChange,
];

addMiddleware(DimensionInstance, (call, next) => {
  if (call.name !== 'setValue') return next(call);

  const newDimensionValue = call.args[0];
  next(call);
  dimensionDependencies.forEach(fn => fn(newDimensionValue));
});

const viewerDependencies = [
  PopulationShapeInstance.onViewerChange,
  CellStatesInstance.onViewerChange,
];

addMiddleware(ViewerInstance, (call, next) => {
  if (call.name !== 'setValue') return next(call);

  const newViewerValue = call.args[0];
  next(call);
  viewerDependencies.forEach(fn => fn(newViewerValue));
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
    rule: Rule,
  })
  .create({
    dimension: DimensionInstance,
    viewer: ViewerInstance,
    cellStates: CellStatesInstance,
    populationShape: PopulationShapeInstance,
    neighbors: NeighborsInstance,
    rule: RuleInstance,
  });

export default AutomataStore;
