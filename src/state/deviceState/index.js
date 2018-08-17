import { types } from 'mobx-state-tree';

const orientationType = types.union(...['landscape', 'portrait'].map(types.literal));

const DeviceState = types
  .model('DeviceState', {
    orientation: orientationType,
  })
  .actions(self => ({
    setOrientationLandscape() { self.orientation = 'landscape'; },
    setOrientationPortrait() { self.orientation = 'portrait'; },
    checkOrientation() {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      self.orientation = orientation;
    },
    afterCreate() {
      self.checkOrientation();
      window.addEventListener('resize', self.checkOrientation)
    },
  }));

const DeviceStateInstance = DeviceState
  .create({
    orientation: 'portrait',
  });

export default DeviceStateInstance;
