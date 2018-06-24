import { css } from 'emotion';

import './styles.scss';

const createApp = (inputName) => {
  const validations = [
    { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
    { validate: v => v % 1 === 0, error: 'Must be a whole number' },
  ];

  const selectorStyles = css`
    width: 80px;
    height: 40px;
    // box-shadow: 1px 2px 3px 2px rgba(0, 0, 0, 0.15);
    border-width: 0px;
    outline: none;
    box-shadow: rgba(0, 0, 0, 0.15) 5px 3px 4px 1px;
    margin-right: 1px;
    background-color: white;

  `;

  const activeSelectorStyle = css`
    background-color: #FFC107;
    box-shadow: rgba(0, 0, 0, 0.15) 5px 3px 4px 1px inset;
  `;

  const selectorPositionedStyles = (position) => {
    if (position === 'left') return 'border-bottom-left-radius: 8px; border-top-left-radius: 8px;'
    else if (position === 'right') return 'border-bottom-right-radius: 8px; border-top-right-radius: 8px;'
    else return '';
  }

  const selector = ({ name, position }) => ({
    $type: 'button',
    style: selectorPositionedStyles(position),
    id: `menu-${inputName}__selector-${name}`,
    $text: name,
    class: selectorStyles,
    _handleSelect: function(e) {
      console.log(e.target)
    },
    $init: function() {
      this.addEventListener('click', this._handleSelect)
    },
  });
  // const inputStyles = css`
  //   border: none;
  //   outline: none;
  //   font-size: 16px;
  //   width: 100%;
  //   padding: 11px;
  //   border-radius: 12px;
  //   margin-left: -11px;
  //   text-align: center;
  //   padding-top: 14px;
  // `
  // const input = {
  //   $type: 'input',
  //   id: `menu-${inputName}__input`,
  //   class: inputStyles,
  //   required: true,
  //   value: 110,
  //   type: 'number',
  //   min: 0,
  //   max: 255,
  //   _setValidationState: function(e) {
  //     const value = e.target.value;
  //     const errors = validations.reduce((acc, v) => {
  //       const isValid = v.validate(value)
  //       if (isValid === false) { acc.push(v.error) }
  //       return acc;
  //     }, [])
  //
  //     if (errors.length > 0) {
  //       const msg = errors[0];
  //       e.target.setCustomValidity(msg)
  //       this._setHelperText(msg)
  //     } else {
  //       this._removeHelperText()
  //       this._setValue(value);
  //     }
  //   },
  //   $init: function() {
  //     this.addEventListener('input', this._setValidationState);
  //   }
  // };

  const labelStyles = css`
    font-size: 14px;
    margin-bottom: 5px;
    color: #314032;
    font-family: monospace;
  `;

  const label = {
    $type: 'label',
    class: labelStyles,
    for:'my-text-field',
    $text: inputName,
  };

  const inputContainerStyles = css`
    // position: relative;
    // width: 100px;
  `;

  const inputContainer = {
    $type: 'div',
    id: `menu-${inputName}__container`,
    class: inputContainerStyles,
    $components: [selector({ name: '1D', position: 'left' }), selector({ name: '2D', position: 'right' })],
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
    $components: [label, inputContainer],
    _value: undefined,
    _setValue: function(value) { this._value = value },
  };

  return app;
};

export default createApp;
