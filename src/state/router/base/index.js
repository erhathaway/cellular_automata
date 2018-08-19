import { types, getRoot, getPath, getType } from 'mobx-state-tree';
import PagesModel from './page';

import {
  dynamicallyGenerateNavToPathMethods,
  dynamicallyGenerateToggleModalMethods,
  dynamicallyGenerateToggleVisibleFeaturesMethods,
  extractScene,
  extractFeatures,
  extractModal,
} from './utils'

const queryString = require('../../../libs/query-string');

const Page = types
  .model('Page', {
    id: types.string,
    name: types.string,
  })

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
    // models
    stack: types.maybe(types.array(types.late(() => RouterBase))), // 'modal' querystring
    scenes: types.maybe(types.array(types.late(() => RouterBase))), // 'pathname' modification
    features: types.maybe(types.array(types.late(() => RouterBase))), // 'show' querystring

    // pages model - not directly create, but indirectly through the `setPages` method
    _pages: types.maybe(types.array(types.late(() => RouterBase))),
    currentPage: types.maybe(Page),
  })
  .actions(self => ({
    /* ------------------------ */
    /* NAV */
    /* ------------------------ */
    nextPage() { console.log('not implemented') },
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
      if (self.currentPage) self.currentPage.updateLocation(newLocation);
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

    /* ------------------------ */
    /* PAGES*/
    /* ------------------------ */
    navToNextPage() {
      self.currentPage = self.nextPage;
    },
    navToPreviousPage() {
      self.currentPage = self.previousPage;
    },
    navToPage(pageId) {
      const found = self._pages.find(p => p.routerKey === pageId);
      if (found) { self.currentPage = found };
    },
    setPags(pages) {
      self._pages = pages.map(({ routerKey: id, name }) => {
        return self.getType(self).create({ id, name })
      });
    },
  }))
  .views(self => ({
    get topOfStack() {
      if (!self.visibleStack) return undefined;

      return self.visibleStack.map(n => n).slice(-1);
    },
    isFeatureVisible(name) {
      return self.visibleFeatures && self.visibleFeatures.map(n => n).includes(name);
    },
    isTopOfStack(name) {
      return self.topOfStack === name;
    },
    get nextPage() {
      const currentPageIndex = self._pages.findIndex(p => p.id === self.currentPage.id);
      const nextPage = self._pages[currentPageIndex + 1];
      return nextPage;
    },
    get previousPage() {
      const currentPageIndex = self._pages.findIndex(p => p.id === self.currentPage.id);
      const nextPage = self._pages[currentPageIndex - 1];
      return nextPage;
    },
  }));

export default RouterBase;
