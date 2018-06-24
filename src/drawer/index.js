import { MDCTemporaryDrawer } from '@material/drawer';
import { css } from 'emotion';

import './styles.scss';
import { inputSelection, dimensionSelection } from '../menu';

const headerStyles = css`
  height: 100px;
  width: 100%;
`;

const header = {
  $type: 'header',
  class: headerStyles,
  // class: 'mdc-drawer__header',
};

const contents = {
  $type: 'nav',
  class: 'mdc-drawer__content',
  $components: [inputSelection('Rule'), dimensionSelection('Dimension'), inputSelection('Neighbors'), inputSelection('Population Count'), dimensionSelection('Growth'), inputSelection('Generations'), inputSelection('Edges')],
};

const drawerContainerStyle = css`
  background-color: #f7ffa9f0 !important;
  border-bottom-right-radius: 15%;
  border-top-right-radius: 15%;
  height: 120% !important;
  top: -10%;
`;

const drawerContainer = {
  $type: 'nav',
  class: 'mdc-drawer__drawer' + ' ' + drawerContainerStyle,
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
