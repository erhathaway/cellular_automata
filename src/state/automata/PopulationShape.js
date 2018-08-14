import { types, addMiddleware, getSnapshot, getEnv, resolvePath, getParent} from 'mobx-state-tree';
import uuid from 'uuid';

import IndexedHistory from '../../libs/indexMSTHistory';

const PopulationShapeIndexedHistory = IndexedHistory
  .named('PopulationShapeIndexedHistory')
  .views(self => ({
    indexName() {
      const parent = getParent(self);
      return parent.keys.length;
    },
  }));

const Shape = types
  .model({
    id: types.identifier,
    x: types.maybe(types.number),
    y: types.maybe(types.number),
    z: types.maybe(types.number),
  })
  .actions(self => ({
    setDimension(dimension, value) {
      self[dimension] = value;
    },
  }));

const PopulationShape = types
  .model('PopulationShape', {
    _shape: types.reference(Shape),
    indexedHistory: types.optional(PopulationShapeIndexedHistory, { targetPath: '../_shape' }),
  })
  .actions(self => ({
    afterCreate() {
      self.indexedHistory.takeSnapshot();
    },
    setDimension(dimensionName, value) {
      self._shape.setDimension(dimensionName, +value);
      self.indexedHistory.takeSnapshot();
    },
    setNumberOfDimensions(value) {
      const number = value[0]

      let newShape;
      if (number === 1) { newShape = { x: 200 }; }
      else if (number === 2) { newShape = { x: 200, y: 300 }; }
      else if (number === 3) { newShape = { x: 20, y: 20, z: 35 }; }

      self.setShape(newShape);
    },
    onDimensionChange(dimensionValue) {
      self.setNumberOfDimensions(dimensionValue);
    },
    setShape(shape) {
      self._shape = Shape.create({ ...shape, id: uuid() });
      self.indexedHistory.takeSnapshot();
    },
  }))
  .views(self => ({
    get shape() {
      const shape = JSON.parse(JSON.stringify(self._shape.toJSON()))
      delete shape.id;
      return shape;
    },
    get keys() {
      if (self.shape) return Object.keys(self.shape);
      return [];
    },
  }));

const PopulationShapeInstance = PopulationShape
  .create({
    _shape: Shape.create({ x: 200, y: 200, id: uuid() }),
  });


// addMiddleware(PopulationShapeInstance, (call, next, abort) => {
  // if (call.name !== 'onDimensionChange') return next(call);

  // const newDimensionValue = call.args[0];
  // const snapshot = PopulationShapeInstance.indexedHistory[newDimensionValue].toJSON().map(v => ({ [v.name]: v.value }));
  // const shape = Object.assign(...snapshot);
  // const indexedHistory = PopulationShapeInstance.indexedHistory;
  // console.log(getSnapshot(indexedHistory))
  // console.log(PopulationShapeInstance)
  // abort(call);
  // next(call);
  // PopulationShapeInstance.setShape(shape);
  // dimensionDependencies.forEach(fn => fn(newDimensionValue));
// });

export {
  PopulationShape,
  PopulationShapeInstance,
};
