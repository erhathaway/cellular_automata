import RouterBase from './base';

const DocumentationRouterInstance = RouterBase
  .create({
    name: 'doc',
    routeKey: 'docs',
    isAtPath: undefined,
    isFromPath: undefined,
    modal: undefined,
  });

export default DocumentationRouterInstance;
