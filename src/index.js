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

import './styles.scss';


const rootClassName = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const bodyClassName = css`
  display: flex;
  width: 100%;
  height: 100vh;
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
  $components: [viewer, menu],

};

const rightMenu = {
  class: rightMenuClassName,
  $components: [playButton, shareButton, fullScreenButton],
};

const body = {
  class: bodyClassName,
  $components: [leftMenu, rightMenu],
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
