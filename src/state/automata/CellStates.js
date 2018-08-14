import { types, getParent } from 'mobx-state-tree';
import uuid from 'uuid';
import IndexedHistory from '../../libs/indexMSTHistory';

const randomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const singleCellStateNumberType = types.union(...[...Array(10).keys()].map(types.literal));

const SingleCellState = types
  .model('SingleCellState', {
    number: singleCellStateNumberType,
    _color: types.frozen(), // hsla object in the form: { h: 0-360, s: 0-1, l: 0-1, a: 0-1 }
  })
  .actions(self => ({
    setColor(color) {
      self._color = color;
    },
  }))
  .views(self => ({
    get hsla() {
      const { h, s, l, a } = self._color;
      return `hsla(${h}, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%, ${a})`;
    },
    get hsl() {
      const { h, s, l } = self._color;
      return `hsl(${h}, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%)`;
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
    _value: types.array(SingleCellState),
    viewerDimensions: types.maybe(types.number), // # from viewer model
    populationDimensions: types.maybe(types.number), // # from dimension model
    indexedHistory: types.optional(CellStatesIndexedHistory, { targetPath: '../_value' }),
  })
  .views(self => ({
    get value() {
      return self._value.map(s => ({ number: +s.number, color: s._color }))
    },
    get number() {
      return self._value.length;
    },
    get hslValues() {
      return self._value.map(s => ({ number: +s.number, color: s.hsl }));
    },
  }))
  .actions(self => ({
    setColor(stateNumber, color) {
      const state = self._value.find(({ number }) => number === stateNumber);
      state.setColor(color);
      self.indexedHistory.takeSnapshot();
    },
    updateState() {
      const historyValue = self.indexedHistory.applyHistoryMatchingCurrentIndex();
      console.log('updating state - index name', self.indexedHistory.indexName())
      console.log('updating state - history value', historyValue)

      if (historyValue) return;

      // if no match, revert to using the default _values
      const pop = self.populationDimensions;
      const view = self.viewerDimensions;
      console.log('updating state - pop value', pop)

      let newValue;
      if (pop === 1) { newValue = [{ number: 0, color: { h: 360, s: 1, l: 1, a: 1 } }, { number: 1, color: { h: 0, s: 0, l: 0, a: 1 } }] }
      else if (pop === 2 && view === 2) { newValue = [{ number: 0, color: { h: 360, s: 1, l: 1, a: 1 } }, { number: 1, color: { h: 234, s: .7, l: .4, a: 1 } }] }
      else if (pop === 2 && view === 3) { newValue = [{ number: 0, color: { h: 360, s: 1, l: 1, a: 1 } }, { number: 1, color: { h: 39, s: 1, l: 0.5, a: 1 } }] }
      else if (pop === 3) { newValue = [{ number: 0, color: { h: 360, s: 1, l: 1, a: 1 } }, { number: 1, color: { h: 39, s: 1, l: 0.5, a: 1 } }] }

      self.setValue(newValue);
    },
    onDimensionChange(dimensionValue) {
      console.log('registering dimension change', dimensionValue)
      self.populationDimensions = dimensionValue;
      self.updateState();
    },
    // method used to subscribe to changes on the Viewer model
    onViewerChange(viewerValue) {
      console.log('registering viewer change', viewerValue)

      self.viewerDimensions = viewerValue;
      self.updateState();
    },
    // number: the state number
    // color: an object describing the hsla _values { h: 0-360, s: 0-1, l: 0-1, a: 0-1 }
    setValue(states) {
      self._value = states.map(({ number, color }) => SingleCellState.create({ number, _color: color }));
      self.indexedHistory.takeSnapshot();
    }
  }));

const createCellStatesValue = () => [
  SingleCellState.create({ number: 0, _color: { h: 360, s: 1, l: 1, a: 1 } }),
  SingleCellState.create({ number: 1, _color: { h: 234, s: .7, l: .4, a: 1 } }),
];

const CellStatesInstance = CellStates
  .create({
    _value: createCellStatesValue(),
    viewerDimensions: 2,
    populationDimensions: 2,
  });

export {
  CellStates,
  CellStatesInstance,
};
