import { types, getRoot, getPath } from 'mobx-state-tree';

import RouterBase from './base';

const MyAutomataLibraryFeatureInstance = RouterBase
  .create({
    name: 'library',
    routeKey: 'library',
  });

const AutomataMenuRouterInstance = RouterBase
  .create({
    name: 'automataMenu',
    routeKey: 'automata-menu',
  });

const ViewRouter = RouterBase
  // .actions(self => ({
  //   // nextPage() {
  //   //   return self.pages[self.currentPage.index-1]
  //   // }
  // }))

const ViewRouterInstance = ViewRouter
  .create({
    name: 'view',
    routeKey: 'view',
    stack: [AutomataMenuRouterInstance],
    features: [MyAutomataLibraryFeatureInstance],
  })

export { ViewRouter, ViewRouterInstance };
