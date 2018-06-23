import { MDCTextFieldHelperText } from '@material/textfield/helper-text';
import { MDCLineRipple } from '@material/line-ripple';
import { MDCTextField } from '@material/textfield';

import './styles.scss';

const createApp = (inputName) => {
  const validations = [
    { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
    { validate: v => v % 1 === 0, error: 'Must be a whole number' },
  ];

  const input = {
    $type: 'input',
    id: `menu-rule-${inputName}__input`,
    class: 'mdc-text-field__input',
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

  const label = {
    $type: 'label',
    class: 'mdc-floating-label',
    for:'my-text-field',
    $text: inputName,
  };

  const ripple = {
    $type: 'div',
    id: `menu-rule-${inputName}__line_ripple`,
    class: 'mdc-line-ripple',
  };

  const helper = {
    $type: 'p',
    id: `menu-rule-${inputName}__helper-text`,
    class: 'mdc-text-field-helper-text',
    'aria-hidden': 'true',
  };

  const container = {
    $type: 'div',
    id: `menu-rule-${inputName}__container`,
    class: "mdc-text-field",
    $components: [input, label, ripple],
  };

  const app = {
    $cell: true,
    $type: 'div',
    id: `menu-rule-${inputName}`,
    class: 'menu-input-selection',
    $components: [container, helper],
    _helperTextAdapter: undefined,
    _helperTextFoundation: undefined,
    _setHelperText: function(text) {
      this._helperTextAdapter.setContent(text)
      this._helperTextFoundation.setPersistent(true)
      this._helperTextFoundation.setValidity(false)
    },
    _removeHelperText: function() {
      this._helperTextAdapter.setContent('')
      this._helperTextFoundation.setValidity(true)
      this._helperTextFoundation.setPersistent(false)
    },
    $init: function() {
      const helperText = new MDCTextFieldHelperText(document.querySelector(`#menu-rule-${inputName}__helper-text`));
      this._helperTextAdapter = helperText.foundation_.adapter_;
      this._helperTextFoundation = helperText.foundation_;

      const lineRipple = new MDCLineRipple(document.querySelector(`#menu-rule-${inputName}__line_ripple`));
      const textField = new MDCTextField(document.querySelector(`#menu-rule-${inputName}__container`));
    }
  };

  return app;
};

export default createApp;
