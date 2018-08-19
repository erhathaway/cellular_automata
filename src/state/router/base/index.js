import { types } from 'mobx-state-tree';

import {
  dynamicallyGenerateNavToPathMethods,
  dynamicallyGenerateToggleModalMethods,
  dynamicallyGenerateToggleVisibleFeaturesMethods,
} from './utils'

const queryString = require('../../../libs/query-string');

const config = {
  homePath: 'view',
  paths: ['', 'view', 'explore'],
  modals: ['documentation', 'intro'],
  visibleFeatures: ['myAutomataLibrary']
};

const routableAppPaths = types.union(...config.paths.map(types.literal));
const routableAppModals = types.union(...config.modals.map(types.literal));

const RouterBase = types
  .model('RouterBase', {
    isAtPath: routableAppPaths,
    isFromPath: types.maybe(routableAppPaths),
    modal: types.maybe(routableAppModals),
  })
  .actions(self => ({
    /* ------------------------ */
    /* NAV */
    /* ------------------------ */
    ...dynamicallyGenerateNavToPathMethods(self, config),
    ...dynamicallyGenerateToggleModalMethods(self, config),
    ...dynamicallyGenerateToggleVisibleFeaturesMethods(self, config),
    // closeModal(history) {
    //   const newLocation = routerService.updateLocationToCloseModals(history.location);
    //   history.push(newLocation);
    // },
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

export default RouterBase;
