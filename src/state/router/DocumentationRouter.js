import RouterBase from './base';
import { PAGES } from '../../constants';

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
    _pages: PAGES.map(p => ({ name: p.pageRouterName, routeKey: p.id, pageInstanceName: 'docPage' })),
  });

export default DocumentationRouterInstance;
