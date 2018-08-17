import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';
import PropTypes from 'prop-types';
import uuid from 'uuid';

const PORTAL_ID = 'popup-area';

class Component extends React.Component {
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
    this.elID = `${'submenu-portal'}${popupName ? `-${popupName}` : ''}`;
    this.el.id = this.elID;
    this.el.style.zIndex = 999;

    this.modalRoot = document.getElementById(`${portalID || PORTAL_ID}`);
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
    const { parentCoords, shouldPosition } = this.props;
    const {
      x,
      y,
      width,
      height,
    } = parentCoords;

    const {
      x: containerX,
      y: containerY,
      width: containerWidth,
      height: containerHeight,
      top: containerTop,
    } = this.modalRoot.getBoundingClientRect();


    let position;
    if (shouldPosition === undefined) {
      if ((x + width / 2) >= (containerWidth / 2)) {
        position = 'left';
      } else {
        position = 'right';
      }
    } else {
      position = shouldPosition;
    }

    this.el.style.position = 'absolute';
    this.el.style.zIndex = 999;
    // TODO make positioning more universal
    if (position === 'right') {
      this.el.style.left = `${x + width - containerX}px`;
      this.el.style.top = `${y - containerY}px`;
      this.el.style.transformOrigin = 'left';
    } else if (position === 'bottom') {
      this.el.style.left = `${x - width / 3 - containerX}px`;
      this.el.style.top = `${y + height - containerY}px`;
      this.el.style.transformOrigin = 'top';
    } else if (position === 'left') {
      this.el.style.right = `${(containerWidth + containerX) - x}px`;
      this.el.style.top = `${y - containerY}px`;
      this.el.style.transformOrigin = 'right';
    } else {
      this.el.style.left = `${x}px`;
      this.el.style.bottom = `${y}px`;
    }
  }

  animateOpen() {
    anime({
      targets: `#${this.elID}`,
      scale: [0, 1],
      duration: 200,
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
      id: uuid(),
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

Component.propTypes = {
  children: PropTypes.element.isRequired,
  shouldHide: PropTypes.func.isRequired,
  clickExclusionCoords: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  }),
  cursorExclusionCoords: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  }),
  parentCoords: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  }).isRequired,
  setPopupCoords: PropTypes.func,
  popupName: PropTypes.string,
  portalID: PropTypes.string,
};

Component.defaultProps = {
  clickExclusionCoords: {},
  cursorExclusionCoords: {},
  setPopupCoords: undefined,
  popupName: undefined,
  portalID: undefined,
};

export default Component;
