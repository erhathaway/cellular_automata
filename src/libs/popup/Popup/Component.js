import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';

const PORTAL_ID = 'popup-area';

export default class Component extends React.Component {
  static isClickOutside({ x: clickX, y: clickY }, { x: elX, y: elY, width: elWidth, height: elHeight }) { // eslint-disable-line max-len, object-curly-newline
    const MARGIN = 20;
    const isOutsideX = clickX < elX - MARGIN || clickX > (elX + elWidth + MARGIN);
    const isOutsideY = clickY < elY - MARGIN || clickY > (elY + elHeight + MARGIN);

    return isOutsideX || isOutsideY;
  }

  constructor(props) {
    super(props);

    this.state = {
      renderPortal: false,
      initialAnimationComplete: false,
    };

    this.el = document.createElement('div');

    const { popupName, portalID } = this.props;
    this.elID = `${'submenu-portal'}${popupName ? '-' + popupName : ''}`;
    this.el.id = this.elID;

    this.modalRoot = document.getElementById(`${portalID ? portalID : PORTAL_ID}`);
    this.modalRoot.appendChild(this.el);

    this.checkIfCursorOutsideEl = this.checkIfCursorOutsideEl.bind(this);
    this.checkIfClickOutsideEl = this.checkIfClickOutsideEl.bind(this);
  }

  componentWillMount() {
    window.addEventListener('mousemove', this.checkIfCursorOutsideEl);
    window.addEventListener('click', this.checkIfClickOutsideEl);
  }

  componentDidMount() {
    this.animateOpen();
    this.setState(state => ({ ...state, renderPortal: true }));
  }

  componentWillUnmount() {
    this.modalRoot.removeChild(this.el);
    window.removeEventListener('mousemove', this.checkIfCursorOutsideEl);
    window.removeEventListener('click', this.checkIfClickOutsideEl);
  }

  sendPopupCoords() {
    const { setPopupCoords } = this.props;

    if (setPopupCoords && typeof setPopupCoords === 'function') {
      const portalCoords = this.el.getBoundingClientRect();
      setPopupCoords(portalCoords);
    }
  }

  positionPortalToParentRef() {
    const { parentCoords } = this.props;
    const {
      x,
      y,
      width,
    } = parentCoords;

    this.el.style.position = 'absolute';
    this.el.style.left = `${x + width}px`;
    this.el.style.top = `${y}px`;
    this.el.style.transformOrigin = 'left';
  }

  animateOpen() {
    anime({
      targets: `#${this.elID}`,
      scale: [0, 1],
      duration: 300,
      opacity: [0, 1],
      delay: 0,
      elasticity: 0,
      easing: 'easeOutQuint',
      complete: () => {
        this.setState(state => ({ ...state, initialAnimationComplete: true }));
        this.sendPopupCoords();
      },
    });
  }

  checkIfCursorOutsideEl(cursorCoords) {
    const { initialAnimationComplete } = this.state;
    if (!initialAnimationComplete) return;

    const { shouldHide, parentCoords, cursorExclusionCoords: exC } = this.props;

    const portalCoords = this.el.getBoundingClientRect();
    const isOutsidePortal = Component.isClickOutside(cursorCoords, portalCoords);
    const isOutsideParent = Component.isClickOutside(cursorCoords, parentCoords);

    // check if other coords were passed to popup to exclude from exiting
    //  this is useful if you want to render additional popups and go into popup hell

    if (exC && exC.x && exC.y && exC.height && exC.width) {
      const isOutsideExclusioncoords = Component.isClickOutside(cursorCoords, exC);
      if (isOutsidePortal && isOutsideParent && isOutsideExclusioncoords) { shouldHide(); }
    } else if (isOutsidePortal && isOutsideParent) {
      shouldHide();
    }
  }

  checkIfClickOutsideEl(cursorCoords) {
    const { initialAnimationComplete } = this.state;
    if (!initialAnimationComplete) return;

    const { shouldHide, clickExclusionCoords: exC } = this.props;

    const portalCoords = this.el.getBoundingClientRect();
    const isOutsidePortal = Component.isClickOutside(cursorCoords, portalCoords);

    if (exC && exC.x && exC.y && exC.height && exC.width) {
      const isOutsideExclusioncoords = Component.isClickOutside(cursorCoords, exC);
      if (isOutsidePortal && isOutsideExclusioncoords) { shouldHide(); }
    } else if (isOutsidePortal) { shouldHide(); }
  }

  render() {
    const { children, ...props } = this.props;
    const { renderPortal } = this.state;

    const childrenWithProps = React.cloneElement(children, {
      ...props,
    });

    this.positionPortalToParentRef();

    if (renderPortal) {
      return ReactDOM.createPortal(
        childrenWithProps,
        this.el,
      );
    }

    return null;
  }
}
