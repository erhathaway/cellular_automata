// import RouterBase from './base';
import Router from 'recursive-router';

import { PAGES } from '../../constants';

const DocMenuRouterInstance = Router
  .create({
    name: 'docMenu',
    routeKey: 'doc-menu',
  });

const DocPageRouterInstance = Router
  .create({
    name: 'docPage',
    routeKey: 'doc-page',
  });

const DocumentationRouterInstance = Router
  .create({
    name: 'doc',
    routeKey: 'docs',
    stack: [DocMenuRouterInstance],
    pages: [DocPageRouterInstance],
    _pages: PAGES.map(p => ({ name: p.pageRouterName, routeKey: p.id, pageInstanceName: 'docPage' })),
  });

export default DocumentationRouterInstance;
