import { css } from 'emotion';

import './styles.scss';

const createApp = ({ cellName, labelName, selections }) => {
  const validations = [
    { validate: v => (v >= 0) && (v <= 255), error: 'Must be between 0 to 255' },
    { validate: v => v % 1 === 0, error: 'Must be a whole number' },
  ];

  const selectorStyles = css`
    width: 100px;
    height: 40px;
    border-width: 0px;
    outline: none;
    box-shadow: rgba(0, 0, 0, 0.15) 5px 3px 4px 1px;
    margin-right: 1px;
    background-color: white;

    -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
       -khtml-user-select: none; /* Konqueror HTML */
         -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
              user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
  `;

  const activeSelectorStyles = css`
    background-color: rgba(255, 193, 7, 0.38);
    box-shadow: rgba(0, 0, 0, 0.15) 5px 3px 4px 1px inset;
  `;

  const inactiveSelectorStyles = css`
    &:hover {
      background-color: #ffffff7d;

    }
  `;

  const selectorPositionedStyles = (position) => {
    if (position === 'left') return 'border-bottom-left-radius: 8px; border-top-left-radius: 8px;'
    else if (position === 'right') return 'border-bottom-right-radius: 8px; border-top-right-radius: 8px;'
    else return '';
  }

  const selector = ({ name, position }) => ({
    $type: 'button',
    style: selectorPositionedStyles(position),
    id: `menu-${cellName}__selector-${name}`,
    $text: name,
    class: selectorStyles,
    _checkSelected: function() {
      if (this._value === name) {
        this.classList.add(activeSelectorStyles)
        this.classList.remove(inactiveSelectorStyles)
      } else {
        this.classList.remove(activeSelectorStyles)
        this.classList.add(inactiveSelectorStyles)
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
    class: labelStyles,
    for:'my-text-field',
    $text: labelName,
  };

  const inputContainerStyles = css`

  `;

  const inputContainer = {
    $type: 'div',
    id: `menu-${cellName}__container`,
    class: inputContainerStyles,
    $components: [selector({ name: selections[0], position: 'left' }), selector({ name: selections[1], position: 'right' })],
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
    id: `menu-${cellName}`,
    class: appStyles,
    $components: [label, inputContainer],
    _updateObservers: [],
    _subscribeToUpdates: function(observer) { this._updateObservers.push(observer) },
    $update: function() { this._updateObservers.forEach(fn => fn() )},
    _value: selections[0],
    _setValue: function(value) { this._value = value },
  };

  return app;
};

export default createApp;
