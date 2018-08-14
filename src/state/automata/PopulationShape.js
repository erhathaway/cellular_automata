import { types, addMiddleware, getEnv, resolvePath } from 'mobx-state-tree';
import uuid from 'uuid';

import IndexedHistory from '../../libs/indexMSTHistory';
// import { TimeTraveller } from 'mst-middleware';

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

const createPopulationShapeValues = ({ x, y, z } = {}) => [
  PopulationDimension.create({ id: uuid(), name: 'x', value: x || 200 }),
  PopulationDimension.create({ id: uuid(), name: 'y', value: y || 150 }),
  PopulationDimension.create({ id: uuid(), name: 'z', value: z || 20 }),
];

// const shapeIndex = (shape) => shape.length;
//
const PopulationShapeHistory = types
  .model('PopulationShapeHistory', {
    1: types.array(types.reference(PopulationDimension)),
    2: types.array(types.reference(PopulationDimension)),
    3: types.array(types.reference(PopulationDimension)),
  })
  .actions(self => ({
    setHistory(populationShape) {
      const dimensions = Object.keys(populationShape).length;
      self[dimensions] = populationShape;
    },
  }));

const PopulationShapeHistoryInstance = PopulationShapeHistory
  .create({
    1: createPopulationShapeValues({ x: 2000 }).slice(0, 1),
    2: createPopulationShapeValues({ x: 200, y: 200 }).slice(0, 2),
    3: createPopulationShapeValues({ x: 35, y: 35, z: 35 }).slice(0, 3),
  });

const PopulationShape = types
  .model('PopulationShape', {
    value: types.array(types.reference(PopulationDimension)),
    history: PopulationShapeHistory,
  })
  .actions(self => ({
    setNumberOfDimensions(number) {
      const newValue = self.value.slice(0, number);
      const diff = number - newValue.length;
      const extraValues = createPopulationShapeValues().slice(0, number).reverse().slice(0, diff);

      const value = [...newValue, ...extraValues];
      self.history.setHistory(value);
      self.value = value;
    },
    onDimensionChange(dimensionValue) {
      self.setNumberOfDimensions(dimensionValue);
    },
    setShape(shape) {
      const value = createPopulationShapeValues(shape);
      self.history.setHistory(value);
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


const PopulationShapeIndexedHistory = IndexedHistory
  .named('PopulationShapeIndexedHistory')
  .views(self => ({
    indexName() {
      const targetStore = self.targetPath
        ? resolvePath(self, self.targetPath)
        : getEnv(self).targetStore;

      return targetStore.value.length;
    },
  }));

const PopulationShapeInstance = PopulationShape
  .create({
    value: createPopulationShapeValues().slice(0, 2),
    history: types.optional(PopulationShapeIndexedHistory, { targetPath: "../value" })
  });


  // addMiddleware(PopulationShapeInstance, (call, next, abort) => {
  //   if (call.name !== 'onDimensionChange') return next(call);
  //
  //   const newDimensionValue = call.args[0];
  //   const snapshot = PopulationShapeInstance.history[newDimensionValue].toJSON().map(v => ({ [v.name]: v.value }));
  //   const shape = Object.assign(...snapshot);
  //   // abort(call);
  //   next(call);
  //   PopulationShapeInstance.setShape(shape);
  //   // dimensionDependencies.forEach(fn => fn(newDimensionValue));
  // });

export {
  PopulationShape,
  PopulationShapeInstance,
};
