import RouterBase from './base';

const DocMenuRouterInstance = RouterBase
  .create({
    name: 'docMenu',
    routeKey: 'doc-menu',
  });

const DocumentationRouterInstance = RouterBase
  .create({
    name: 'doc',
    routeKey: 'docs',
    stack: [DocMenuRouterInstance],
  });

export default DocumentationRouterInstance;
