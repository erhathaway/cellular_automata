import { types } from 'mobx-state-tree';
import uuid from 'uuid';

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

export {
  Dimension,
  DimensionInstance,
};
