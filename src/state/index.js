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
      const dimensionValue = value[0]
      console.log('onDimensionChange', dimensionValue)
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
    dependencies: types.array(types.reference(Dimension)),
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
    dependencies: [DimensionInstance],
  });

/* -----------------------------------------------------------------------------
Dimension Dependency Middleware
----------------------------------------------------------------------------- */

const dimensionDependencies = [
  PopulationShapeInstance.onDimensionChange,
  ViewerInstance.onDimensionChange,
];

addMiddleware(DimensionInstance, (call, next, abort) => {
  const newDimensionValue = call.args;
  next(call);
  dimensionDependencies.forEach(fn => fn(newDimensionValue));
});

/* -----------------------------------------------------------------------------
Root Store
----------------------------------------------------------------------------- */

const RootStore = types
  .model('RootStore', {
    dimension: Dimension,
    viewer: Viewer,
    populationShape: PopulationShape,
  })
  .create({
    dimension: DimensionInstance,
    viewer: ViewerInstance,
    populationShape: PopulationShapeInstance,
  });

export default RootStore;
