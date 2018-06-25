import './styles.scss';
import { MDCRipple } from '@material/ripple';

const app = {
  $cell: true,
  $type: 'button',
  class: 'mdc-icon-button material-icons',
  id: 'fullscreen-button',
  $text : 'fullscreen',
  _exitFullScreen: function(el) {
    if (el.mozCancelFullScreen) {
      el.mozCancelFullScreen();
    } else if (el.webkitExitFullscreen) {
      el.webkitExitFullscreen();
    } else if (el.msExitFullscreen) {
      el.msExitFullscreen();
    } else if (el.exitFullscreen) {
      el.exitFullscreen();
    }
  },
  _enterFullScreen: function(el) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen()
    }
  },
  // if (!document.fullscreen && !document.webkitRequestFullscreen && !document.mozRequestFullScreen && !document.msRequestFullscreen) {
  _toggleFullScreen: function() {
    const body = document.body
    if(!!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.mozFullScreenElement || !!document.msFullscreenElement) {
      this._exitFullScreen(document)
    } else {
      this._enterFullScreen(body)
    }
  },
  onclick: function() {
    this._toggleFullScreen();
    // const rootEl = document.getElementById('root');
    //
    // // this.requestFullscreen();
    // document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
    // if (rootEl.requestFullscreen) {
    //   rootEl.requestFullscreen();
    // }
  },
  $init: function() {
    const iconButtonRipple = new MDCRipple(document.querySelector('#fullscreen-button'));
    iconButtonRipple.unbounded = true;
  }
}

export default app;
