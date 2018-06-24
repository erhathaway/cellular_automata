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
    border-width: 0px;
    outline: none;
    box-shadow: rgba(0, 0, 0, 0.15) 5px 3px 4px 1px;
    margin-right: 1px;
    background-color: white;

  `;

  const activeSelectorStyle = css`
    // background-color: #FFC107;
    background-color: rgba(255, 193, 7, 0.38);
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
    _checkSelected: function() {
      if (this._value === name) {
        this.classList.add(activeSelectorStyle)
      } else {
        this.classList.remove(activeSelectorStyle)
      }
    },
    _handleClick: function() { this._setValue(name) },
    $init: function() {
      this._subscribeToUpdates(this._checkSelected);
      this.addEventListener('click', this._handleClick);
    },
  });

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
    _updateObservers: [],
    _subscribeToUpdates: function(observer) { this._updateObservers.push(observer) },
    $update: function() { this._updateObservers.forEach(fn => fn() )},
    _value: undefined,
    _setValue: function(value) { this._value = value },
  };

  return app;
};

export default createApp;
