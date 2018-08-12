import { types } from 'mobx-state-tree';
import uuid from 'uuid';

const dimensionValueType = types.union(...['1D', '2D', '3D'].map(types.literal));

const Dimension = types.model({
  id: types.identifier,
  value: dimensionValueType,
}).actions((self) => {
  function setDimension(newDimension) { self.value = newDimension; }
  return { setDimension }
});

const DimensionInstance = Dimension.create({
  id: uuid(),
  value: '2D',
});

const dimensionNameType = types.union(...['x', 'y', 'z'].map(types.literal));

const PopulationDimension = types.model({
  id: types.identifier,
  name: dimensionNameType,
  value: types.optional(types.number, 10),
}).actions((self) => {
  function setValue(newValue) {
    self.value = +newValue;
  }
  return { setValue }
});

const PopulationShape = types.model({
  value: types.array(types.reference(PopulationDimension)),
  dependencies: types.array(types.reference(Dimension)),
}).actions((self) => {
  function validate() {
    console.log(self);
  }
  return { validate }
});

const PopulationShapeInstance = PopulationShape.create({
  value: [
    PopulationDimension.create({ id: uuid(), name: 'x', value: 1000 }),
    PopulationDimension.create({ id: uuid(), name: 'y', value: 200000 }),
    PopulationDimension.create({ id: uuid(), name: 'z', value: 20 }),
  ],
  dependencies: [DimensionInstance],
});

const RootStore = types.model({
  dimension: Dimension,
  populationShape: PopulationShape,
}).create({
  dimension: DimensionInstance,
  populationShape: PopulationShapeInstance,
});

export default RootStore;
