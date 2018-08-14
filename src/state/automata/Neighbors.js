import { types } from 'mobx-state-tree';
import uuid from 'uuid';

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
    onDimensionChange(dimensionValue) {
      // const dimensionValue = value[0];
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

export {
  Neighbors,
  NeighborsInstance,
};
