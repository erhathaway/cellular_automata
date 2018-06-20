import './styles.scss';
import { MDCRipple } from '@material/ripple';

const app = {
  $cell: true,
  $type: 'button',
  class: 'mdc-icon-button material-icons',
  id: 'fullscreen-button',
  $text : 'fullscreen',
  onclick: function() { console.log('fullscreen') },
  $init: function() {
    const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
    iconButtonRipple.unbounded = true;
  }
}

export default app;
