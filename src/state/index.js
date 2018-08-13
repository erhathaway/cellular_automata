import { types, addMiddleware } from 'mobx-state-tree';
import uuid from 'uuid';

/* -----------------------------------------------------------------------------
Dimension
----------------------------------------------------------------------------- */

const dimensionValueType = types.union(...[1, 2, 3].map(types.literal));

const Dimension = types
  .model('Dimension', {
    id: types.identifier,
    value: dimensionValueType,
  })
  .actions(self => ({
    setValue(newDimension) { self.value = newDimension; },
  }));

const DimensionInstance = Dimension
  .create({
    id: uuid(),
    value: 2,
  });

/* -----------------------------------------------------------------------------
Viewer
----------------------------------------------------------------------------- */

const viewerValueType = types.union(...[1, 2, 3].map(types.literal));

const Viewer = types
  .model('Viewer', {
    id: types.identifier,
    value: viewerValueType,
  })
  .actions(self => ({
    setValue(newDimension) { self.value = newDimension; },
    onDimensionChange(value) {
      const dimensionValue = value[0];

      if (dimensionValue === 1 && self.value !== 2) {
        self.setValue(2);
      } else if (dimensionValue === 2 && (self.value !== 2 || self.value !== 3)) {
        self.setValue(2);
      } else if (dimensionValue === 3 && self.value !== 3) {
        self.setValue(3);
      }
    },
  }));

const ViewerInstance = Viewer
  .create({
    id: uuid(),
    value: 2,
  });


/* -----------------------------------------------------------------------------
Cell States
----------------------------------------------------------------------------- */
const randomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const singleCellStateNumberType = types.union(...[...Array(10).keys()].map(types.literal));

const SingleCellState = types
  .model('SingleCellState', {
    id: types.identifier,
    number: singleCellStateNumberType,
    color: types.optional(types.string, randomHexColor),
  })
  .actions(self => ({
    setColor(color) {
      self.color = color;
    },
  }));

const CellStates = types
  .model('CellStates', {
    value: types.array(types.reference(SingleCellState)),
  })
  .views(self => ({
    get number() {
      return self.value.length;
    },
  }));

const createCellStatesValue = () => [
  SingleCellState.create({ id: uuid(), number: 0, color: '#FFFFFF' }),
  SingleCellState.create({ id: uuid(), number: 1, color: '#000000' }),
];

const CellStatesInstance = CellStates
  .create({
    value: createCellStatesValue(),
  });

/* -----------------------------------------------------------------------------
Population Shape
----------------------------------------------------------------------------- */

const dimensionNameType = types.union(...['x', 'y', 'z'].map(types.literal));

const PopulationDimension = types
  .model('PopulationDimension', {
    id: types.identifier,
    name: dimensionNameType,
    value: types.optional(types.number, 10),
  })
  .actions(self => ({
    setValue(newValue) {
      self.value = +newValue;
    },
  }));

const createPopulationShapeValues = () => [
  PopulationDimension.create({ id: uuid(), name: 'x', value: 1000 }),
  PopulationDimension.create({ id: uuid(), name: 'y', value: 200000 }),
  PopulationDimension.create({ id: uuid(), name: 'z', value: 20 }),
];

const PopulationShape = types
  .model('PopulationShape', {
    value: types.array(types.reference(PopulationDimension)),
  })
  .actions(self => ({
    setNumberOfDimensions(number) {
      const newValue = self.value.slice(0, number);
      const diff = number - newValue.length;
      const extraValues = createPopulationShapeValues().slice(0, number).reverse().slice(0, diff);

      self.value = [...newValue, ...extraValues];
    },
    onDimensionChange(dimensionValue) {
      self.setNumberOfDimensions(dimensionValue);
    },
  }));


const PopulationShapeInstance = PopulationShape
  .create({
    value: createPopulationShapeValues(),
  });

/* -----------------------------------------------------------------------------
Neighbors
----------------------------------------------------------------------------- */

const SingleNeighbor = types
  .model('SingleNeighbor', {
    id: types.identifier,
    value: types.string,
  })
  .views(self => ({
    // deseralize from 'x|y+1', 'x+1|y', 'x-1|y|z-1', 'x|y|z+2', 'x-3|y|z', etc...
    // into { x: <Int>, y: <Int>, z: <Int }
    get coordinates() {
      const dimensions = self.value.split('|');
      const coords = dimensions.reduce((acc, d, index) => {
        let magnitude = 0;
        if (d.includes('+')) {
          const i = d.indexOf('+');
          magnitude = +d.slice(i + 1);
        }
        if (d.includes('-')) {
          const i = d.indexOf('-');
          magnitude = +d.slice(i + 1) * -1;
        }

        if (index === 0) {
          acc.x = magnitude;
        } else if (index === 1) {
          acc.y = magnitude;
        } else if (index === 2) {
          acc.z = magnitude;
        }

        return acc;
      }, { x: 0, y: 0, z: 0 });

      return coords;
    },
  }));

const createOneDimensionNeighborsValue = () => (
  ['x-1', 'x+1']
    .map(n => SingleNeighbor.create({ id: uuid(), value: n }))
);

const createTwoDimensionNeighborsValue = () => (
  ['x|y+1', 'x+1|y+1', 'x+1|y', 'x+1|y-1', 'x|y-1', 'x-1|y-1', 'x-1|y', 'x-1|y+1']
    .map(n => SingleNeighbor.create({ id: uuid(), value: n }))
);

const createThreeDimensionNeighborsValue = () => (
  [
    'x|y+1|z', 'x+1|y+1|z', 'x+1|y|z', 'x+1|y-1|z', 'x|y-1|z', 'x-1|y-1|z', 'x-1|y|z', 'x-1|y+1|z',
    'x|y+1|z+1', 'x+1|y+1|z+1', 'x+1|y|z+1', 'x+1|y-1|z+1', 'x|y-1|z+1', 'x-1|y-1|z+1', 'x-1|y|z+1', 'x-1|y+1|z+1', 'x|y|z+1',
    'x|y+1|z-1', 'x+1|y+1|z-1', 'x+1|y|z-1', 'x+1|y-1|z-1', 'x|y-1|z-1', 'x-1|y-1|z-1', 'x-1|y|z-1', 'x-1|y+1|z-1', 'x|y|z-1',
  ]
    .map(n => SingleNeighbor.create({ id: uuid(), value: n }))
);


const Neighbors = types
  .model('Neighbor', {
    value: types.array(types.reference(SingleNeighbor)),
  })
  .actions(self => ({
    onDimensionChange(value) {
      const dimensionValue = value[0];
      if (dimensionValue === 1) {
        self.value = createOneDimensionNeighborsValue();
      } else if (dimensionValue === 2) {
        self.value = createTwoDimensionNeighborsValue();
      } else if (dimensionValue === 3) {
        self.value = createThreeDimensionNeighborsValue();
      }
    },
  }));

const NeighborsInstance = Neighbors.create({
  value: createTwoDimensionNeighborsValue(),
});

/* ---------------------------------------------------------------
Dimension Dependency Middleware
----------------------------------------------------------------------------- */

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

const RootStore = types
  .model('automataStore', {
    dimension: Dimension,
    viewer: Viewer,
    cellStates: CellStates,
    populationShape: PopulationShape,
    neighbors: Neighbors
  })
  .create({
    dimension: DimensionInstance,
    viewer: ViewerInstance,
    cellStates: CellStatesInstance,
    populationShape: PopulationShapeInstance,
    neighbors: NeighborsInstance,
  });

export default RootStore;
