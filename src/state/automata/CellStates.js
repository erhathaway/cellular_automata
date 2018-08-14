import { types, getParent } from 'mobx-state-tree';
import uuid from 'uuid';
import IndexedHistory from '../../libs/indexMSTHistory';

const randomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const singleCellStateNumberType = types.union(...[...Array(10).keys()].map(types.literal));

const SingleCellState = types
  .model('SingleCellState', {
    number: singleCellStateNumberType,
    color: types.optional(types.string, randomHexColor),
  })
  .actions(self => ({
    setColor(color) {
      self.color = color;
    },
  }));

const CellStatesIndexedHistory = IndexedHistory
  .named('CellStatesIndexedHistory')
  .views(self => ({
    indexName() {
      const parent = getParent(self);
      return `${parent.populationDimensions}-${parent.viewerDimensions}`;
    },
  }));


const CellStates = types
  .model('CellStates', {
    value: types.array(SingleCellState),
    viewerDimensions: types.maybe(types.number), // # from viewer model
    populationDimensions: types.maybe(types.number), // # from dimension model
    indexedHistory: types.optional(CellStatesIndexedHistory, { targetPath: '../value' }),
  })
  .views(self => ({
    get number() {
      return self.value.length;
    },
  }))
  .actions(self => ({
    setColor(stateNumber, color) {
      const state = self.value.find(({ number }) => number === stateNumber);
      state.setColor(color);
      self.indexedHistory.takeSnapshot();
    },
    updateState() {
      const historyValue = self.indexedHistory.applyHistoryMatchingCurrentIndex();

      if (historyValue) return;

      // if no match, revert to using the default values
      const pop = self.populationDimensions;
      const view = self.viewerDimensions;

      let newValue;
      if (pop === 1) { newValue = [{ number: 0, color: '#FFFFFF' }, { number: 1, color: '#000000' }] }
      else if (pop === 2 && view === 2) { newValue = [{ number: 0, color: '#FFFFFF' }, { number: 1, color: '#000000' }] }
      else if (pop === 2 && view === 3) { newValue = [{ number: 0, color: '#FFFFFF' }, { number: 1, color: '#000000' }] }
      else if (pop === 3) { newValue = [{ number: 0, color: '#FFFFFF' }, { number: 1, color: '#000000' }] }

      self.setValue(newValue);
    },
    onDimensionChange(dimensionValue) {
      self.populationDimensions = dimensionValue;
      self.updateState();
    },
    // method used to subscribe to changes on the Viewer model
    onViewerChange(viewerValue) {
      self.viewerDimensions = viewerValue;
      self.updateState();
    },
    setValue(states) {
      self.value = states.map(({ number, color }) => SingleCellState.create({ number, color }));
      self.indexedHistory.takeSnapshot();
    }
  }));

const createCellStatesValue = () => [
  SingleCellState.create({ number: 0, color: '#FFFFFF' }),
  SingleCellState.create({ number: 1, color: '#000000' }),
];

const CellStatesInstance = CellStates
  .create({
    value: createCellStatesValue(),
    viewerDimensions: 2,
    populationDimensions: 2,
  });

export {
  CellStates,
  CellStatesInstance,
};
