import RouterBase from './base';

import ViewRouterInstance from './ViewRouter';
import DocumentationRouterInstance from './DocumentationRouter';
import IntroRouterInstance from './IntroRouter';

const RootRouterInstance = RouterBase
  .named('RootRouter')
  .create({
    name: 'root',
    routeKey: '',
    stack: [DocumentationRouterInstance, IntroRouterInstance],
    scenes: [ViewRouterInstance],
  });

export default RootRouterInstance;
