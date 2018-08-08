import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';
// import uuid from 'uuid';

import styled from 'react-emotion';

const Container = styled('div')`
`;

const PortalContainer = () => (
  <Container />
);

// const PortalID = (() => uuid())();

export default class Component extends React.Component {
  static isClickOutside({ x: clickX, y: clickY }, { x: elX, y: elY, width: elWidth, height: elHeight }) {
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
    }

    this.el = document.createElement('div');

    const { portalName } = this.props;
    this.elID = `${'submenu-portal'}${portalName ? '-' + portalName : ''}`;
    this.el.id = this.elID;

    this.modalRoot = document.getElementById('view-submenu-modal-root');

    this.checkIfCursorOutsideEl = this.checkIfCursorOutsideEl.bind(this);
    this.checkIfClickOutsideEl = this.checkIfClickOutsideEl.bind(this);
  }


  componentWillMount() {
    this.modalRoot.appendChild(this.el);
    window.addEventListener('mousemove', this.checkIfCursorOutsideEl);
    window.addEventListener('click', this.checkIfClickOutsideEl);
  }

  componentDidMount() {
    this.animateOpen();
    this.setState(state => ({ renderPortal: true}))
  }

  componentWillUnmount() {
    this.modalRoot.removeChild(this.el);
    window.removeEventListener('mousemove', this.checkIfCursorOutsideEl);
    window.removeEventListener('click', this.checkIfClickOutsideEl);
  }

  positionPortalToParentRef() {
    const { parentCoords } = this.props;
    const {
      x,
      y,
      width,
      height,
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
        this.setState(state => ({ ...state, initialAnimationComplete: true }))
      }
    });
  }

  checkIfCursorOutsideEl(cursorCoords) {
    const { initialAnimationComplete } = this.state;
    if (!initialAnimationComplete) return;

    const { shouldHide, parentCoords } = this.props;

    const portalCoords =  this.el.getBoundingClientRect();
    const isOutsidePortal = Component.isClickOutside(cursorCoords, portalCoords);
    const isOutsideParent = Component.isClickOutside(cursorCoords, parentCoords);
    if (isOutsidePortal && isOutsideParent) { shouldHide(); }
  }

  checkIfClickOutsideEl(cursorCoords) {
    const { initialAnimationComplete } = this.state;
    if (!initialAnimationComplete) return;

    const { shouldHide } = this.props;

    const portalCoords =  this.el.getBoundingClientRect();
    const isOutsidePortal = Component.isClickOutside(cursorCoords, portalCoords);

    if (isOutsidePortal) { shouldHide(); }
  }

  render() {
    const { children, shouldHide } = this.props;
    const { renderPortal } = this.state;

    // console.log(hide)
    // const coords
    this.positionPortalToParentRef();

    // const childrenWithProps = React.Children.map(children, child =>
    //   React.cloneElement(child, { handleClick: this.handleClick }));


    if (renderPortal) {
      return ReactDOM.createPortal(
        children,
        this.el,
      );
    }

    return null;
  }
}
