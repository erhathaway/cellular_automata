import { types } from 'mobx-state-tree';

const dimensionValueType = types.union(...['1D', '2D', '3D'].map(types.literal));

const Dimension = types.model({
  value: dimensionValueType,
}).actions(self => {
  function setDimension(newDimension) {
    console.log('setting dimension')
    self.value = newDimension
  }
  return {setDimension}
})
// .create({
//   value: '2D',
// });

const View = types.model({
  value: types.string,
  // dependencies: types.array(Dimension),
})
// .create({
//   value: '3D',
// });

const RootStore = types.model({
  dimension: Dimension,
  view: View,
}).create({
  dimension: { value: '2D' },
  view: { value: '1D' },
});

export default RootStore;
