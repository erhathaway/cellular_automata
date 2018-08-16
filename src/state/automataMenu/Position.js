import { types } from 'mobx-state-tree';

const positionValueType = types.union(...['left', 'top', 'right', 'floating'].map(types.literal));
const dockingStateValueType = types.union(...[
  'canDock',
  'startDock', 'endDock', 'hasDocked',
  'startUndock', 'endUndock', 'Undocked',
].map(types.literal));

const Position = types
  .model('Dimension', {
    position: positionValueType,
    dockingState: dockingStateValueType,
  })
  .actions(self => ({
    setPosition(newPosition) { self.position = newPosition; },
    setDockingState(newDockingState) { self.dockingState = newDockingState; },
  }));

const PositionInstance = Position
  .create({
    position: 'left',
    dockingState: 'hasDocked',
  });

export {
  Position,
  PositionInstance,
};
