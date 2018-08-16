import {
  types,
  getParent,
} from 'mobx-state-tree';

import IndexedHistory from '../../libs/indexMSTHistory';

const Shape = types
  .model({
    x: types.maybe(types.number),
    y: types.maybe(types.number),
    z: types.maybe(types.number),
  })
  .actions(self => ({
    setDimension(dimension, value) {
      self[dimension] = value;
    },
  }));

const PopulationShapeIndexedHistory = IndexedHistory
  .named('PopulationShapeIndexedHistory')
  .views(self => ({
    indexName() {
      const parent = getParent(self);
      return `${parent.populationDimensions}-${parent.viewerDimensions}`;
    },
  }));

const PopulationShape = types
  .model('PopulationShape', {
    _shape: Shape,
    viewerDimensions: types.maybe(types.number), // # from viewer model
    populationDimensions: types.maybe(types.number), // # from dimension model
    indexedHistory: types.optional(PopulationShapeIndexedHistory, { targetPath: '../_shape' }),
  })
  .actions(self => ({
    afterCreate() {
      self.indexedHistory.takeSnapshot();
    },
    // change dimension value (x, y, z)
    setDimension(dimensionName, value) {
      self._shape.setDimension(dimensionName, +value);
      self.indexedHistory.takeSnapshot();
    },
    // change the shape
    // middleware uses the most recent historical value if there is one rather than calling this method
    updateShape() {
      // check history for matching index and use that
      const historyValue = self.indexedHistory.applyHistoryMatchingCurrentIndex();
      if (historyValue) return;

      // if no match, revert to using the default values
      const pop = self.populationDimensions;
      const view = self.viewerDimensions;

      let newShape;
      if (pop === 1) { newShape = { x: 200 }; }
      else if (pop === 2 && view === 2) { newShape = { x: 200, y: 300 }; }
      else if (pop === 2 && view === 3) { newShape = { x: 70, y: 50 }; }
      else if (pop === 3) { newShape = { x: 20, y: 20, z: 35 }; }

      self.setShape(newShape);
    },
    // method used to subscribe to changes on the Dimension model
    onDimensionChange(dimensionValue) {
      self.populationDimensions = dimensionValue;
      self.updateShape();
    },
    // method used to subscribe to changes on the Viewer model
    onViewerChange(viewerValue) {
      self.viewerDimensions = viewerValue;
      self.updateShape();
    },
    setShape(shape) {
      self._shape = Shape.create({ ...shape });
      self.indexedHistory.takeSnapshot();
    },
  }))
  .views(self => ({
    get shape() {
      // remove keys with undefined values
      const shape = JSON.parse(JSON.stringify(self._shape.toJSON()));
      return shape;
    },
    get keys() {
      if (self.shape) return Object.keys(self.shape);
      return [];
    },
  }));

const PopulationShapeInstance = PopulationShape
  .create({
    _shape: Shape.create({ x: 200, y: 200 }),
    viewerDimensions: 2,
    populationDimensions: 2,
  });

export {
  PopulationShape,
  PopulationShapeInstance,
};
