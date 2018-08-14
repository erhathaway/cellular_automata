import { types } from 'mobx-state-tree';
import uuid from 'uuid';

const viewerValueType = types.union(...[1, 2, 3].map(types.literal));

const Viewer = types
  .model('Viewer', {
    id: types.identifier,
    value: viewerValueType,
  })
  .actions(self => ({
    setValue(newDimension) { self.value = newDimension; },
    onDimensionChange(dimensionValue) {
      // const dimensionValue = value[0];

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

export {
  Viewer,
  ViewerInstance,
};
