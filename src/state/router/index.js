import { types } from 'mobx-state-tree';

import { RootRouter, RootRouterInstance } from './RootRouter';

const RouterStore = types
  .model('routerStore', {
    rootRouter: RootRouter,
  })
  .create({
    rootRouter: RootRouterInstance,
  });

export default RouterStore;
