import { MDCTextField } from '@material/textfield';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import { css } from 'emotion';

import './styles.scss';

const validations = [
  { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
  { validate: v => v % 1 === 0, error: 'Must be a whole number' },
];

const selectorStyle = css`
  width: 100%;
  height: 30px;
  border: 1px solid rgba(0, 0, 0, 0.42);
  margin: 5px;
  border-radius: 1px;
`;

const selectorContainerStyle = css`
  display: flex;
  width: 200px;
`;

const selector = (name) => ({
  $type: 'div',
  id: `menu-dimension-selection__selector-${name}`,
  class: selectorStyle,
})

const selectorContainer = {
  $type: 'div',
  id: 'menu-dimension-selection__container',
  class: selectorContainerStyle,
  $components: [selector('1D'), selector('2D')]
};

const label = {
  $type: 'label',
  class: 'mdc-floating-label',
  for: 'menu-dimension-selection__container',
  $text: 'Dimension',
};

const ripple = {
  $type: 'div',
  class: 'mdc-line-ripple',
};

const helper = {
  $type: 'p',
  id: 'menu-dimension-selection__helper-text',
  // class: 'mdc-text-field-helper-text',
  'aria-hidden': 'true',
};

const container = {
  $type: 'div',
  id: "menu-dimension-selection__container",
  // class: "mdc-text-field",
  $components: [label, selectorContainer, ripple],
};

const app = {
  $cell: true,
  $type: 'div',
  id: 'menu-dimension-selection',
  $components: [container],
};

export default app;
