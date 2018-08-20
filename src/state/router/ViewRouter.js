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

const ViewRouterInstance = RouterBase
  .create({
    name: 'view',
    routeKey: 'view',
    stack: [AutomataMenuRouterInstance],
    features: [MyAutomataLibraryFeatureInstance],
  });

export default ViewRouterInstance;
