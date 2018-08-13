import { types } from 'mobx-state-tree';
import uuid from 'uuid';

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
  PopulationDimension.create({ id: uuid(), name: 'x', value: 200 }),
  PopulationDimension.create({ id: uuid(), name: 'y', value: 150 }),
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
  }))
  .views(self => ({
    get shape() {
      return self.value.reduce((acc, d) => {
        acc[d.name] = d.value;
        return acc;
      }, {});
    },
  }));


const PopulationShapeInstance = PopulationShape
  .create({
    value: createPopulationShapeValues(),
  });

export {
  PopulationShape,
  PopulationShapeInstance,
};
