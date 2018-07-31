import './styles.scss'
import {MDCRipple} from '@material/ripple';

const icon = (iconName) => ({
  $type: 'span',
  class: 'mdc-fab__icon material-icons',
  $text: iconName,
});

const app = {
  $cell: true,
  $type: 'button',
  class: 'mdc-fab',
  id: 'play-button',
  _active: true,
  _iconName: 'play_arrow',
  onclick: function() {
    this._active = !this._active;
    const simulator = document.getElementById('automata-viewer');
    simulator._changeRunningState(this._active);
  },
  _updateIcon: function() {
    if (this._active) { this._iconName = 'pause' }
    else { this._iconName = 'play_arrow' }
    this.$components = [icon(this._iconName)]
  },
  $update: function() { this._updateIcon();},
  $components: [icon('play_arrow')],
  $init: function() {
    const fabRipple = new MDCRipple(document.querySelector('#play-button'));
    this._updateIcon();
  }
}

export default app;
