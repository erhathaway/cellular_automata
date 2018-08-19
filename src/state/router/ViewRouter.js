import RouterBase from './base';

const MyAutomataLibraryFeatureInstance = RouterBase
  .create({
    name: 'library',
    routeKey: 'library',
  });

const ViewRouterInstance = RouterBase
  .create({
    name: 'view',
    routeKey: 'view',
    isAtPath: undefined,
    isFromPath: undefined,
    modal: undefined,
    features: [MyAutomataLibraryFeatureInstance],
  });

export default ViewRouterInstance;
