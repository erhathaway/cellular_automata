import { types } from 'mobx-state-tree';
import uuid from 'uuid';

const randomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const singleCellStateNumberType = types.union(...[...Array(10).keys()].map(types.literal));

const SingleCellState = types
  .model('SingleCellState', {
    id: types.identifier,
    number: singleCellStateNumberType,
    color: types.optional(types.string, randomHexColor),
  })
  .actions(self => ({
    setColor(color) {
      self.color = color;
    },
  }));

const CellStates = types
  .model('CellStates', {
    value: types.array(types.reference(SingleCellState)),
  })
  .views(self => ({
    get number() {
      return self.value.length;
    },
  }));

const createCellStatesValue = () => [
  SingleCellState.create({ id: uuid(), number: 0, color: '#FFFFFF' }),
  SingleCellState.create({ id: uuid(), number: 1, color: '#000000' }),
];

const CellStatesInstance = CellStates
  .create({
    value: createCellStatesValue(),
  });

export {
  CellStates,
  CellStatesInstance,
};
