import { types } from 'mobx-state-tree';
import RouterBase from './base';

const RootRouter = RouterBase
  .named('RootRouter');
  // .views(self => ({
  //   indexName() {
  //     const parent = getParent(self);
  //     return `${parent.populationDimensions}-${parent.viewerDimensions}`;
  //   },
  // }));

  const RootRouterInstance = RootRouter
    .create({
      isAtPath: 'view',
      isFromPath: undefined,
      modal: 'intro',
    });

export { RootRouter, RootRouterInstance };
