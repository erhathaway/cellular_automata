import { types } from 'mobx-state-tree';

import { Position, PositionInstance } from './Position';

const AutomataMenuStore = types
  .model('automataStore', {
    position: Position,
  })
  .create({
    position: PositionInstance,
  });

export default AutomataMenuStore;
