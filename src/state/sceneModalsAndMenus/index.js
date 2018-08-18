import { types } from 'mobx-state-tree';

const SceneModalsAndMenus = types
  .model('SceneModalsAndMenus', {
    showViewMyAutomataMenu: types.boolean,
    showViewAutomataConfigModalMenu: types.boolean,
    showDocumentationIndexModalMenu: types.boolean,
  })
  .actions(self => ({
    toggleShowViewMyAutomataMenu() { self.showViewMyAutomataMenu = !self.showViewMyAutomataMenu; console.log('show my automata', self.showViewMyAutomataMenu)}, // eslint-disable-line max-len
    toggleShowViewAutomataConfigModalMenu() { self.showViewAutomataConfigModalMenu = !self.showViewAutomataConfigModalMenu; }, // eslint-disable-line max-len
    toggleShowDocumentationIndexModalMenu() { self.showDocumentationIndexModalMenu = !self.showDocumentationIndexModalMenu; }, // eslint-disable-line max-len
  }));

const SceneModalsAndMenusInstance = SceneModalsAndMenus
  .create({
    showViewMyAutomataMenu: true,
    showViewAutomataConfigModalMenu: false,
    showDocumentationIndexModalMenu: false,
  });

export default SceneModalsAndMenusInstance;
