// import { types } from 'mobx-state-tree';
//
// const placementValueType = types.union(...['left', 'top', 'right', 'floating'].map(types.literal));
// const dockingStateValueType = types.union(...[
//   'canDock',
//   'startDock', 'endDock', 'hasDocked',
//   'startUndock', 'endUndock', 'Undocked',
// ].map(types.literal));
//
//
// const Position = types
//   .model('Dimension', {
//     placement: placementValueType,
//     dockingState: dockingStateValueType,
//     isMoving: types.boolean,
//   })
//   .actions(self => ({
//     setPosition(newPosition) { self.placement = newPosition; },
//     setDockingState(newDockingState) { self.dockingState = newDockingState; },
//     turnIsMovingOn() { self.isMoving = true; },
//     turnIsMovingOff() { self.isMoving = false; },
//     toggleIsMoving() { self.isMoving = !self.isMoving; },
//   }));
//
// const PositionInstance = Position
//   .create({
//     placement: 'left',
//     dockingState: 'hasDocked',
//     isMoving: false,
//   });
//
// export {
//   Position,
//   PositionInstance,
// };
