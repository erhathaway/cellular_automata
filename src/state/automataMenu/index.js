import { types } from 'mobx-state-tree';

const placementValueType = types.union(...['left', 'top', 'right', 'floating'].map(types.literal));
const dockingStateValueType = types.union(...['canDock', 'docked', 'undocked'].map(types.literal));

const Position = types
  .model('Dimension', {
    placement: placementValueType,
    dockingState: dockingStateValueType,
    isMoving: types.boolean,
  })
  .actions(self => ({
    setPlacement(newPlacement) { self.placement = newPlacement; },
    setDockingState(newDockingState) { self.dockingState = newDockingState; },
    turnIsMovingOn() { self.isMoving = true; },
    turnIsMovingOff() { self.isMoving = false; },
    toggleIsMoving() { self.isMoving = !self.isMoving; },
  }))
  .views(self => ({
    get isDocked() {
      if (
        self.dockingState === 'startDock' ||
        self.dockingState === 'endDock' ||
        self.dockingState === 'docked' ||
        self.dockingState === 'startUndock'
      ) return true;
      return false;
    },
    get canDock() {
      if (self.dockingState === 'canDock') return true;
      return false;
    },
    get placementAndMenuState() {
      if (self.dockingState === 'docked' && self.placement === 'left') return 'hasDockedLeft';
      if (self.dockingState === 'docked' && self.placement === 'top') return 'hasDockedTop';
      if (self.dockingState === 'docked' && self.placement === 'right') return 'hasDockedRight';
      if (self.dockingState === 'canDock' && self.placement === 'left') return 'canDockLeft';
      if (self.dockingState === 'canDock' && self.placement === 'top') return 'canDockTop';
      if (self.dockingState === 'canDock' && self.placement === 'right') return 'canDockRight';
      return undefined;
    }
  }));

const PositionInstance = Position
  .create({
    placement: 'floating',
    dockingState: 'undocked',
    isMoving: false,
  });

export default PositionInstance;
