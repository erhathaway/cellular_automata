import { types } from 'mobx-state-tree';
import RouterBase from './base';

import { ViewRouter, ViewRouterInstance } from './ViewRouter';
import DocumentationRouterInstance from './DocumentationRouter';
import IntroRouterInstance from './IntroRouter';

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
      name: 'root',
      routeKey: '',
      stack: [DocumentationRouterInstance, IntroRouterInstance],
      scenes: [ViewRouterInstance],
    });

    // console.log(ViewRouterInstance)

export default RootRouterInstance;
