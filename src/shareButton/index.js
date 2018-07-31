import './styles.scss';
import { MDCRipple } from '@material/ripple';

const app = {
  $cell: true,
  $type: 'button',
  class: 'mdc-icon-button material-icons',
  id: 'share-button',
  $text : 'share',
  onclick: function() { console.log('sharing') },
  $init: function() {
    const iconButtonRipple = new MDCRipple(document.querySelector('#share-button'));
    iconButtonRipple.unbounded = true;
  }
}

export default app;
