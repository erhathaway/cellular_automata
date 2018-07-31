import { MDCRipple } from '@material/ripple';
import { css } from 'emotion';

const icon = (iconName) => ({
  $type: 'span',
  class: 'mdc-fab__icon material-icons',
  $text: iconName,
});

const appStyles = css`
  position: absolute;
  left: 0px;
  top: 55px;
  background-color: orange;
  height: 60px;
  width: 60px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 15px;
  border-top-left-radius: 0px;
  border-top-right-radius: 15px;
`;

const app = {
  $cell: true,
  $type: 'button',
  class: 'mdc-fab' + ' ' + appStyles,
  id: 'menu-button',
  _active: false,
  _iconName: 'menu',
  $components: [icon('menu')],
  $init: function() {
    const fabRipple = new MDCRipple(document.querySelector('#menu-button'));
  }
}

export default app;
