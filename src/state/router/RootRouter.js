import { types } from 'mobx-state-tree';
import { router as routerService } from '../../services';

const queryString = require('../../libs/query-string');

const config = {
  home: 'view',
  paths: ['', 'view', 'explore'],
  modals: ['documentation', 'intro'],
};

const dynamicallyGenerateNavToPathMethods = () => {
  return config.paths.reduce((acc, name) => {

    // remove forward slashes
    const withoutSlash = name.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash !== '' ? (withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1)) : 'Home';
    // generate path name
    const pathName = name === '/' ? config.home : name;

    // generate method
    const fnObj = { [`navTo${formattedName}`](history) {
      const newLocation = routerService.updateLocationToCloseModals(history.location);
      history.push({ pathname: pathName, search: newLocation.search, state: newLocation.state });
    },
    };
    return { ...fnObj, ...acc };
  }, {});
};

const dynamicallyGenerateOpenModalMethods = () => {
  return config.modals.reduce((acc, modalName) => {

    // remove forward slashes
    const withoutSlash = modalName.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1);

    // generate method
    const fnObj = { [`open${formattedName}Modal`](history) {
      const newLocation = routerService.updateLocationToCloseModals(history.location);
      const newSearch = routerService.addToQueryString(newLocation.search, { modal: modalName }); // modals are shown via the 'modal' field in the query string

      history.push({ pathname: newLocation.pathname, search: newSearch, state: newLocation.state });
    },
    };
    return { ...fnObj, ...acc };
  }, {});
};

const routableAppPaths = types.union(...config.paths.map(types.literal));
const routableAppModals = types.union(...config.modals.map(types.literal));

const RootRouter = types
  .model('RootRouter', {
    isAtPath: routableAppPaths,
    isFromPath: types.maybe(routableAppPaths),
    modal: types.maybe(routableAppModals),
  })
  .actions(self => ({
    /* ------------------------ */
    /* NAV */
    /* ------------------------ */
    ...dynamicallyGenerateNavToPathMethods(),
    ...dynamicallyGenerateOpenModalMethods(),
    closeModal(history) {
      const newLocation = routerService.updateLocationToCloseModals(history.location);
      history.push(newLocation);
    },
    updateLocation(newLocation) {
      const modalName = self.getModal(newLocation)
      if (modalName) self.modal = modalName;
      else {
        self.modal = undefined;
        self.setAt(self.getPath(newLocation));
      }
    },
    /* ------------------------ */
    /* HISTORY */
    /* ------------------------ */
    setAt(newAtName) {
      self.isFromPath = self.isAtPath;
      self.isAtPath = newAtName;
    },
    getModal(location) {
      const parsedQuery = queryString.parse(location.search, { decode: true });
      return parsedQuery.modal
    },
    getPath(location) {
      // remove forward slashes
      return location.pathname.replace(/\//g, '')
    },
  }))
  .views(self => ({

  }));

const RootRouterInstance = RootRouter
  .create({
    isAtPath: 'view',
    isFromPath: undefined,
    modal: 'intro',
  });

console.log(RootRouter)
export { RootRouter, RootRouterInstance };
