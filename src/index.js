import { css } from 'emotion';

import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import {MDCLineRipple} from '@material/line-ripple';
import {MDCTextField} from '@material/textfield';

import menu from './menu';
import viewer from './viewer';
import sceneTabs from './sceneTabs';
import playButton from './playButton';
import shareButton from './shareButton';
import fullScreenButton from './fullScreenButton';
import drawer from './drawer';

import './styles.scss';


const rootClassName = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  // height: 100vh;
  height: 100%;
  width: 100%;
  // overflow-y: hidden;
`;

const bodyClassName = css`
  display: flex;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  justify-content: space-between;
`;

const leftMenuClassName = css`

`;

const rightMenuClassName = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 60px;

  > * {
    margin-bottom: 30px;
  }
`;

const leftMenu = {
  class: leftMenuClassName,
  $components: [drawer],

};

const rightMenu = {
  class: rightMenuClassName,
  $components: [playButton, shareButton, fullScreenButton],
};

const body = {
  class: bodyClassName,
  $components: [leftMenu, rightMenu, viewer],
};

const app = {
  id: "root",
  $cell: true,
  class: rootClassName,
  $type: "div",
  $init: () => {
    const helperText = new MDCTextFieldHelperText(document.querySelector('.mdc-text-field-helper-text'));
    const lineRipple = new MDCLineRipple(document.querySelector('.mdc-line-ripple'));
    const textField = new MDCTextField(document.querySelector('.mdc-text-field'));
  },
  $components: [sceneTabs, body],
}

export default app;
