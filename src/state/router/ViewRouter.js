// import RouterBase from './base';
import Router from 'recursive-router';

const MyAutomataLibraryFeatureInstance = Router
  .create({
    name: 'library',
    routeKey: 'library',
  });

const AutomataMenuRouterInstance = Router
  .create({
    name: 'automataMenu',
    routeKey: 'automata-menu',
  });

const ViewRouterInstance = Router
  .create({
    name: 'view',
    routeKey: 'view',
    stack: [AutomataMenuRouterInstance],
    features: [MyAutomataLibraryFeatureInstance],
  });

export default ViewRouterInstance;
