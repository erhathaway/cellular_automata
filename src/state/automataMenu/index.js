import { types } from 'mobx-state-tree';

// import { Position, PositionInstance } from './Position';
//
// const AutomataMenuStore = types
//   .model('automataMenuStore', {
//     position: Position,
//   })
//   .create({
//     position: PositionInstance,
//   });
//
// export default AutomataMenuStore;
// import { types } from 'mobx-state-tree';

const placementValueType = types.union(...['left', 'top', 'right', 'floating'].map(types.literal));
const dockingStateValueType = types.union(...['canDock', 'docked', 'undocked'].map(types.literal));

const Position = types
  .model('Dimension', {
    placement: placementValueType,
    dockingState: dockingStateValueType,
    isMoving: types.boolean,
  })
  .actions(self => ({
    setPlacement(newPlacement) { self.placement = newPlacement; console.log(self.placement)},
    setDockingState(newDockingState) { self.dockingState = newDockingState; console.log(self.dockingState)},
    turnIsMovingOn() { self.isMoving = true; console.log('moving', self.isMoving) },
    turnIsMovingOff() { self.isMoving = false; console.log('moving', self.isMoving) },
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
    placement: 'left',
    dockingState: 'canDock',
    isMoving: false,
  });

export default PositionInstance;
