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
    x: types.maybe(types.number),
    y: types.maybe(types.number),
    z: types.maybe(types.number),
  })
  .actions(self => ({
    setDimension(dimension, value) { self[dimension] = value; },
  }));

const PopulationShape = types
  .model('PopulationShape', {
    my: Shape,
    history: types.optional(PopulationShapeIndexedHistory, { targetPath: '../my' }),
  })
  .actions(self => ({
    setNumberOfDimensions(value) {
      const number = value[0]

      let newShape;
      if (number === 1) { newShape = Shape.create({ x: 200 }); }
      else if (number === 2) { newShape = Shape.create({ x: 200, y: 300 }); }
      else if (number === 3) { newShape = Shape.create({ x: 20, y: 20, z: 35 }); }

      self.my = newShape;
    },
    onDimensionChange(dimensionValue) {
      self.setNumberOfDimensions(dimensionValue);
    },
    setShape(shape) {
      self.my = Shape.create(shape);
    },
  }))
  .views(self => ({
    get shape() {
      return JSON.parse(JSON.stringify(self.my.toJSON()))
    },
    get keys() {
      if (self.shape) return Object.keys(self.shape);
      return [];
    },
  }));

const PopulationShapeInstance = PopulationShape
  .create({
    my: Shape.create({ x: 200, y: 200 }),
  });


  addMiddleware(PopulationShapeInstance, (call, next, abort) => {
    if (call.name !== 'onDimensionChange') return next(call);

    // const newDimensionValue = call.args[0];
    // const snapshot = PopulationShapeInstance.history[newDimensionValue].toJSON().map(v => ({ [v.name]: v.value }));
    // const shape = Object.assign(...snapshot);
    const history = PopulationShapeInstance.history;
    // console.log(getSnapshot(history))
    // console.log(PopulationShapeInstance)
    // abort(call);
    next(call);
    // PopulationShapeInstance.setShape(shape);
    // dimensionDependencies.forEach(fn => fn(newDimensionValue));
  });

export {
  PopulationShape,
  PopulationShapeInstance,
};
