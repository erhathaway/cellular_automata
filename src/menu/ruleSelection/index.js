// import { MDCTextFieldHelperText } from '@material/textfield/helper-text';
// import { MDCLineRipple } from '@material/line-ripple';
// import { MDCTextField } from '@material/textfield';
import { css } from 'emotion';

import './styles.scss';

const createApp = (inputName) => {
  const validations = [
    { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
    { validate: v => v % 1 === 0, error: 'Must be a whole number' },
  ];

  const inputStyles = css`
    border: none;
    outline: none;
    font-size: 20px;
    width: 100%;
  `
  const input = {
    $type: 'input',
    id: `menu-${inputName}__input`,
    class: inputStyles,
    required: true,
    value: 110,
    type: 'number',
    min: 0,
    max: 255,
    _setValidationState: function(e) {
      const value = e.target.value;
      const errors = validations.reduce((acc, v) => {
        const isValid = v.validate(value)
        if (isValid === false) { acc.push(v.error) }
        return acc;
      }, [])

      if (errors.length > 0) {
        const msg = errors[0];
        e.target.setCustomValidity(msg)
        this._setHelperText(msg)
      } else {
        this._removeHelperText()
      }
    },
    $init: function() {
      this.addEventListener('input', this._setValidationState);
    }
  };

  const labelStyles = css`
    font-size: 14px;
    margin-bottom: 5px;
    color: #4CAF50;
    // color: #37793a;
    font-family: monospace;
  `;

  const label = {
    $type: 'label',
    class: labelStyles,
    for:'my-text-field',
    $text: inputName,
  };

  const underlineStyles = css`
    border-bottom: 1px solid rgba(76, 175, 80, 0.4);
    height: 1px;
    width: 70%;
    margin-top: 2px;
    // border-color: #4CAF50;
    margin-bottom: 7px;
  `;

  const underline = {
    $type: 'div',
    id: `menu-${inputName}__underline`,
    class: underlineStyles,
  };

  const helperStyles = css`
    height: 20px;
    width: 100%;
    margin-top: 7px;
    color: rgba(0,0,0,.6);
    font-family: monospace;
  `;

  const helper = {
    $type: 'div',
    id: `menu-${inputName}__helper`,
    class: helperStyles,
  };

  const inputContainerStyles = css`
    position: relative;
    width: 100px;
  `;

  const inputContainer = {
    $type: 'div',
    id: `menu-${inputName}__container`,
    class: inputContainerStyles,
    $components: [input],
  };

  const appStyles = css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 50px;
    margin-bottom: 25px;
  `;

  const app = {
    $cell: true,
    $type: 'div',
    id: `menu-${inputName}`,
    class: appStyles,
    $components: [label, underline, inputContainer, helper],
    _setHelperText: function(text) {
      document.getElementById(helper.id).$text = text;
    },
    _removeHelperText: function() {
      document.getElementById(helper.id).$text = '';
    },
  };

  return app;
};

export default createApp;
