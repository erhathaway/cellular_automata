import RouterBase from './base';

const DocMenuRouterInstance = RouterBase
  .create({
    name: 'docMenu',
    routeKey: 'doc-menu',
  });


  const DocPageRouterInstance = RouterBase
    .create({
      name: 'docPage',
      routeKey: 'doc-page',
    });

const DocumentationRouterInstance = RouterBase
  .create({
    name: 'doc',
    routeKey: 'docs',
    stack: [DocMenuRouterInstance],
    pages: [DocPageRouterInstance],
  });

export default DocumentationRouterInstance;
