import { MDCTemporaryDrawer } from '@material/drawer';

import './styles.scss';
import { inputSelection, dimensionSelection } from '../menu';

const header = {
  $type: 'header',
  class: 'mdc-drawer__header',
};

const contents = {
  $type: 'nav',
  class: 'mdc-drawer__content',
  $components: [inputSelection('Rule'), dimensionSelection, inputSelection('Other')],
};

const drawerContainer = {
  $type: 'nav',
  class: 'mdc-drawer__drawer',
  $components: [header, contents],
};

const app = {
  $cell: true,
  $type: 'aside',
  class: 'mdc-drawer mdc-drawer--temporary',
  id: 'drawer-root',
  _drawer: undefined,
  _openDrawer: function() { this._drawer.open = true },
  $components: [drawerContainer],
  onclick: function() { console.log('sharing') },
  $init: function() {
    this._drawer = new MDCTemporaryDrawer(document.querySelector('.mdc-drawer--temporary'));
    this._openDrawer();
    document.querySelector('#fullscreen-button').addEventListener('click', this._openDrawer);
  }
};

export default app;
