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
  margin-bottom: 20px;

  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
`;

const header = {
  $type: 'header',
  class: headerStyles,
  $text: 'Configure',
};

const inputRuleElementAttributes = {
  value: 110,
  type: 'number',
  min: 0,
  max: 255,
};

const inputNeighborsElementAttributes = {
  value: 2,
  type: 'number',
  min: 1,
  max: 255,
};

const inputPopulationElementAttributes = {
  value: 100,
  type: 'number',
  min: 2,
};

const inputGenerationsElementAttributes = {
  value: 50,
  type: 'number',
  min: 1,
};

const inputEdgesElementAttributes = {
  value: 2,
  type: 'number',
  min: 0,
  max: 255,
};

const contents = {
  $type: 'nav',
  class: 'mdc-drawer__content',
  $components: [
    textInputSelection({ labelName: 'Rule (0-255)', cellName: 'rule', updateFn: '_setRule', inputElementAttributes: inputRuleElementAttributes }),
    buttonSelection({ labelName: 'Dimension', cellName: 'dimension', updateFn: '_setDimension', selections: ['1D', '2D'] }),
    textInputSelection({ labelName: 'Neighbors (1+)', cellName: 'neighbors', updateFn: '_setNeighbors', inputElementAttributes: inputNeighborsElementAttributes }),
    textInputSelection({ labelName: 'Population Count', cellName: 'population', updateFn: '_setPopulation', inputElementAttributes: inputPopulationElementAttributes }),
    buttonSelection({ labelName: 'Growth', cellName: 'growth', updateFn: '_setGrowth', selections: ['Fixed', 'Continuous'] }),
    textInputSelection({ labelName: 'Generations', cellName: 'generations', updateFn: '_setGenerations', inputElementAttributes: inputGenerationsElementAttributes }),
    textInputSelection({ labelName: 'Edges', cellName: 'edges', updateFn: '_setEdges', inputElementAttributes: inputEdgesElementAttributes })
  ],
};

const drawerContainerStyle = css`
  // background-color: #f7ffa9f0 !important;
      background-color: #000000db !important;
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
    document.querySelector('#menu-button').addEventListener('click', this._openDrawer);
  }
};

export default app;
