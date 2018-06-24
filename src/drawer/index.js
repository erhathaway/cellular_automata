import { MDCTemporaryDrawer } from '@material/drawer';
import { css } from 'emotion';

import './styles.scss';
import { textInputSelection, buttonSelection } from '../menu';

const headerStyles = css`
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: monospace;
  letter-spacing: 4px;
  color: #FF9800;
  font-size: 15px;
  margin-top: 20px;
`;

const header = {
  $type: 'header',
  class: headerStyles,
  $text: 'Configure',
};

const contents = {
  $type: 'nav',
  class: 'mdc-drawer__content',
  $components: [
    textInputSelection('Rule'),
    buttonSelection({ labelName: 'Dimension', cellName: 'dimension', selections: ['1D', '2D'] }),
    textInputSelection('Neighbors'),
    textInputSelection('Population Count'),
    buttonSelection({ labelName: 'Growth', cellName: 'growth', selections: ['Fixed', 'Continuous'] }),
    textInputSelection('Generations'),
    textInputSelection('Edges')
  ],
};

const drawerContainerStyle = css`
  // background-color: #f7ffa9f0 !important;
      background-color: #000000d4 !important;
  // border-bottom-right-radius: 15%;
  // border-top-right-radius: 15%;
  // height: 110% !important;
  // top: -10%;

  display: flex;
  flex-direction: column;
  justify-content: center;
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
