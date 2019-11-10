// import RouterBase from './base';
import Router from 'recursive-router';

import ViewRouterInstance from './ViewRouter';
import DocumentationRouterInstance from './DocumentationRouter';
import IntroRouterInstance from './IntroRouter';

const RootRouterInstance = Router
  .named('RootRouter')
  .create({
    name: 'root',
    routeKey: '',
    stack: [DocumentationRouterInstance, IntroRouterInstance],
    scenes: [ViewRouterInstance],
  });

export default RootRouterInstance;


// export default RouterBase
//   .named('RootRouter')
//   .create({ name: 'root',
//     stack: [
//       // root card 1
//       RouterBase.create({ name: 'doc',
//         // doc card 1
//         stack: [RouterBase.create({ name: 'docMenu' })],
//         // doc page
//         page: RouterBase.create({ name: 'docPage' }),
//         availablePages: PAGES.map(p => ({ name: p.pageRouterName, routeKey: p.id, pageInstanceName: 'docPage' })),
//       }),
//       // root card 2
//       RouterBase.create({ name: 'intro' }),
//     ],
//     scenes: [
//       // root scene 1
//       RouterBase.create({ name: 'view',
//         stack: [AutomataMenuRouterInstance],
//         features: [MyAutomataLibraryFeatureInstance],
//       });
//     ],
//   });


// {
//   name: "root",
//   stack: [
//     {
//       name: "doc",
//       stack: [ { name: "docMenu"} ],
//       shouldOpen: fn,
//       beforeOpen: fn,
//       afterOpen: fn,
//       shouldClose: fn,
//       beforeClose: fn,
//       afterClose: fn,
//     },
//     { name: "intro" }
//   ]
// }
