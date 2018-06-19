import { css } from 'emotion';

import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import {MDCLineRipple} from '@material/line-ripple';
import {MDCTextField} from '@material/textfield';

import menu from './menu';
import viewer from './viewer';

import './styles.scss'


const className = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const app = {
  $cell: true,
  class: className,
  $type: "div",
  $init: () => {
    const helperText = new MDCTextFieldHelperText(document.querySelector('.mdc-text-field-helper-text'));
    const lineRipple = new MDCLineRipple(document.querySelector('.mdc-line-ripple'));
    const textField = new MDCTextField(document.querySelector('.mdc-text-field'));
  },
  $components: [viewer, menu],
}

export default app;
