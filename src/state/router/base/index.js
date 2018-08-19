import { types, getRoot, getPath } from 'mobx-state-tree';

import {
  dynamicallyGenerateNavToPathMethods,
  dynamicallyGenerateToggleModalMethods,
  dynamicallyGenerateToggleVisibleFeaturesMethods,
  extractScene,
  extractFeatures,
  extractModal,
} from './utils'

const queryString = require('../../../libs/query-string');

const RouterBase = types
  .model('RouterBase', {
    // config
    name: types.string,
    routeKey: types.string,
    // state
    isAtScene: types.maybe(types.string),
    isFromScene: types.maybe(types.string),
    visibleStack: types.maybe(types.array(types.string)),
    visibleFeatures: types.maybe(types.array(types.string)),
    // modals
    stack: types.maybe(types.array(types.late(() => RouterBase))), // 'modal' querystring
    scenes: types.maybe(types.array(types.late(() => RouterBase))), // 'pathname' modification
    features: types.maybe(types.array(types.late(() => RouterBase))), // 'show' querystring
  })
  .actions(self => ({
    /* ------------------------ */
    /* NAV */
    /* ------------------------ */
    ...dynamicallyGenerateNavToPathMethods(self),
    ...dynamicallyGenerateToggleModalMethods(self),
    ...dynamicallyGenerateToggleVisibleFeaturesMethods(self),
    afterCreate() {
      // addd getter methods to access the routers from the parent
      const root = getRoot(self);
      const children = [].concat(self.modals).concat(self.features).concat(self.scenes)
        .filter(c => c && true);

      children.forEach(child => {
        Object.defineProperty(root, `${child.name}Router`, {
          get: function() { return child }
        });
      })
    },
    updateLocation(newLocation) {
      // pass down the new location state to all routers and update their stores accordingly
      self.updateScene(extractScene(newLocation, self.routeKey))
      self.updateStack(extractModal(newLocation, self.routeKey))
      self.updateVisibleFeatures(extractFeatures(newLocation, self.routeKey))

      if (self.scenes) self.scenes.forEach(s => s.updateLocation(newLocation));
      if (self.modals) self.modals.forEach(m => m.updateLocation(newLocation));
      if (self.features) self.features.forEach(f => f.updateLocation(newLocation));
    },
    /* ------------------------ */
    /* HISTORY */
    /* ------------------------ */
    updateScene(newScene) {
      // console.log('updating scene', self.name, '---', newScene);

      if (newScene) {
        self.isFromScene = self.isAtScene;
        self.isAtScene = newScene;
      }
    },
    updateStack(visibleStack) {
      // console.log('updating open modals', self.name, '---', visibleStack);
      self.visibleStack = visibleStack;
    },
    updateVisibleFeatures(features) {
      // console.log('updating visible features', self.name, '---', features);
      self.visibleFeatures = features;
    },
    /* ------------------------ */
    /* HISTORY UTILS*/
    /* ------------------------ */
    setAt(newAtName) {
      // console.log('here', getRoot(self))
      // console.log(self)
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
    topOfStack() {
      if (!self.visibleStack) return undefined;

      return self.visibleStack.map(n => n).slice(-1);
    },
    isFeatureVisible(name) {
      return self.visibleFeatures && self.visibleFeatures.map(n => n).includes(name);
    },
    isTopOfStack(name) {
      return self.topOfStack === name;
    },
  }));

export default RouterBase;
