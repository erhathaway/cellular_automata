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
  constructor(props) {
    super(props);

    this.state = {
      renderPortal: true,
    }

    this.el = document.createElement('div');

    const { portalName } = this.props;
    this.elID = `${'submenu-portal'}${portalName ? '-' + portalName : ''}`;
    this.el.id = this.elID;

    this.modalRoot = document.getElementById('view-submenu-modal-root');
  }

  componentDidMount() {
    this.modalRoot.appendChild(this.el);
    this.animateOpen();
  }

  componentWillUnmount() {
    this.modalRoot.removeChild(this.el);
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
  }

  animateOpen() {
    anime({
      targets: `#${this.elID}`,
      scale: [0, 1],
      translateX: [-100, 0],
      translateY: [50, 0],
      duration: 400,
      opacity: [0, 1],
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    });
  }

  // handleClick() {
  //   console.log('click')
  // }

  render() {
    const { children, hide } = this.props;
    const { renderPortal } = this.state;

    console.log(hide)
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
