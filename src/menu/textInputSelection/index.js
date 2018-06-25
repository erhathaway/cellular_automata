import { css } from 'emotion';

import './styles.scss';

const createApp = ({ cellName, labelName, inputElementAttributes }) => {
  const validations = [
    { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
    { validate: v => v % 1 === 0, error: 'Must be a whole number' },
  ];

  const inputStyles = css`
    border: none;
    outline: none;
    font-size: 16px;
    width: 75%;
    // padding: 11px;
    border-radius: 12px;
    text-align: center;
    // padding-top: 14px;
    background-color: #ffffff70;

    height: 30px;
    padding: 0;
    padding-right: 10%;
    padding-left: 15%;

    &:hover {
      box-shadow: rgba(0, 0, 0, 0.15) 1px 2px 1px 0px inset;
      background-color: #ffffff7d;
    }
  `
  const input = {
    $type: 'input',
    id: `menu-${cellName}__input`,
    class: inputStyles,
    required: true,
    ...inputElementAttributes,
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
        this._setValue(value);
      }
    },
    $init: function() {
      this.addEventListener('input', this._setValidationState);
    }
  };

  const labelStyles = css`
    // margin-bottom: 5px;
    // color: #4CAF50;
    // color: #37793a;
    // color: #314032;
    color: #4caf50bd;
    font-family: monospace;
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 7px;

    -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
       -khtml-user-select: none; /* Konqueror HTML */
         -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
              user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
  `;

  const label = {
    $type: 'label',
    class: labelStyles + ' .noselect',
    for:'my-text-field',
    $text: labelName,
  };

  const underlineStyles = css`
    border-bottom: 1px solid rgba(76, 175, 80, 0.4);
    height: 1px;
    width: 70%;
    margin-top: 2px;
    margin-bottom: 7px;
  `;

  const underline = {
    $type: 'div',
    id: `menu-${cellName}__underline`,
    class: underlineStyles,
  };

  const helperStyles = css`
    margin-top: 7px;
    // color: rgba(0,0,0,.6);
    font-family: monospace;
    color: #4eb5939c;
    margin-bottom: 11px;
  `;

  const helper = {
    $type: 'div',
    id: `menu-${cellName}__helper`,
    class: helperStyles,
  };

  const inputContainerStyles = css`
    position: relative;
    width: 200px;
  `;

  const inputContainer = {
    $type: 'div',
    id: `menu-${cellName}__container`,
    class: inputContainerStyles,
    $components: [input],
  };

  const appStyles = css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 50px;
    margin-bottom: 10px;
  `;

  const app = {
    $cell: true,
    $type: 'div',
    id: `menu-${cellName}`,
    class: appStyles,
    $components: [label, inputContainer, helper],
    _value: undefined,
    _setValue: function(value) { this._value = value },
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
