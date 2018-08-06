import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';
import Draggable from 'react-draggable';

// import Container from './Container';

import styled, { css } from 'react-emotion';

const MENU_WIDTH = 160;
const MENU_BORDER_RADIUS = '11px';

const Container = styled('div')`
  height: 100vh;
  width: 100vw;
`;

const Menu = styled('nav')`
  position: fixed;
  width: ${MENU_WIDTH}px;
  height: 70px;
  background-color: rgba(54, 149, 217, 0.8);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  border-radius: ${MENU_BORDER_RADIUS};
  z-position: 2;
`;

const PlacementOutline = styled('nav')`
  position: fixed;
  ${({ left }) => left && `left: ${left};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ top }) => top && `top: ${top};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ width }) => width && `width: ${width};`}

  z-position: 1;
  background-color: rgba(94, 80, 80, 0.8);
  opacity: 1;
  opacity: ${({ shouldShow }) => (shouldShow ? 1 : 0) };
`;

/* ----------------------------------------------------------------------------*/
/* Menu Router Container
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const RouterContainerHorizontal = css`
  height: 100%;
  flex-direction: row;
  width: 150px;
  border-radius: 0px;
`;

// dock left or right
const RouterContainerVertical = css`
  width: 100%;
  flex-direction: row;
  height: 50px;
`;

const RouterContainerNotDocked = css`
  width: 100%;
  flex-direction: row;
`;

const RouterContainer = styled('nav')`
  position: absolute;
  bottom: 0px;
  left: 0px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(54, 149, 217, 1);
  border-bottom-left-radius: ${MENU_BORDER_RADIUS};
  border-bottom-right-radius: ${MENU_BORDER_RADIUS};

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && RouterContainerNotDocked) }
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && RouterContainerHorizontal) }
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && RouterContainerVertical) }
`;

/* ----------------------------------------------------------------------------*/
/* Menu Router Features
/* ----------------------------------------------------------------------------*/
// dock top or bottom
const FAIconHorizontal = css`
  height: 100%;

  &:hover {
    border-radius: 0px;
  }
`;

// dock left or right
const FAIconVertical = css`
  padding: 10px;
`;

const FAIconNotDocked = css`
  padding: 10px;
  &:hover {
    border-radius: 0px;
  }
`;

const FAIcon = styled('div')`
  color: gray;
  font-size: 20px;
  font-weight: light;
  width: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgba(54, 149, 217, 1);
    background-color: gray;
    ${({ leftOrRight }) => `border-bottom-${leftOrRight}-radius: ${MENU_BORDER_RADIUS};`}
  };

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && FAIconNotDocked) }
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && FAIconHorizontal) }
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && FAIconVertical) }
`;

/* ----------------------------------------------------------------------------*/
/* Menu Control Container
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const MenuControllerContainerHorizontal = css`
  right: 0px;
  height: 100%;
  flex-direction: row;
  width: 150px;
`;

// dock left or right
const MenuControllerContainerVertical = css`
  left: 0px;
  width: 100%;
  height: 50px;
  border-radius: 0px;
`;

// not docked
const MenuControllerContainerNotDocked = css`
  left: 0px;
  width: 100%;
  height: 35px;
`;


const MenuControllerContainer = styled('div')`
  position: absolute;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && MenuControllerContainerNotDocked) }
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && MenuControllerContainerHorizontal) }
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && MenuControllerContainerVertical) }

`;

/* ----------------------------------------------------------------------------*/
/* Menu Control Features
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const MenuDraggableContainerHorizontal = css`
  width: 50%;
  height: 100%;
`;

// dock left or right
const MenuDraggableContainerVertical = css`
  width: 100%;
  height: 100%;
`;

// not docked
const MenuDraggableContainerNotDocked = css`
  width: 100%;
  height: 100%;
  border-top-left-radius: ${MENU_BORDER_RADIUS};
`;

const MenuDraggableContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 2;
  background-color: rgba(54, 149, 217, 0.7);

  &:hover {
    cursor: grab;
  }


  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && MenuDraggableContainerNotDocked) }
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && MenuDraggableContainerHorizontal) }
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && MenuDraggableContainerVertical) }
`;

const DraggableIcon = styled('div')`
  background-color: gray;
  border-radius: 50%;
  height: 6px;
  width: 6px;
  margin: 5px;
  margin-left: 3px;
  margin-right: 3px;
`;

// dock top or bottom
const MenuShrinkContainerHorizontal = css`
  width: 50%;
  height: 100%;
`;

// dock left or right
const MenuShrinkContainerVertical = css`
  width: 70px;
  height: 100%;
`;

// not docked
const MenuShrinkContainerNotDocked = css`
  width: 70px;
  height: 100%;
  border-top-right-radius: ${MENU_BORDER_RADIUS};
`;

const MenuShrinkContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(54, 149, 217, 1);

  &:hover {
    cursor: pointer;
  }

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && MenuShrinkContainerNotDocked) }
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && MenuShrinkContainerHorizontal) }
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && MenuShrinkContainerVertical) }
`;

const MenuShrinkButton = styled('div')`
  width: 20px;
  background-color: gray;
  height: 4px;
  border-radius: 2px;
`;


export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      menuPlacement: undefined, // willDockTop, willDockLeft, willDockRight, hasDockedTop, hasDockedLeft, hasDockedRight
      width: undefined, // window.width
      height: undefined, // window.height
      menuX: 50,
      menuY: 70,
    };

    this.myRef = React.createRef();

    this.handleMenuOpenToggleClick = this.handleMenuOpenToggleClick.bind(this);
    this.onStartDragEvent = this.onStartDragEvent.bind(this);
    this.onDragEvent = this.onDragEvent.bind(this);
    this.onStopDragEvent = this.onStopDragEvent.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
   }

  componentDidMount() {
    if (this.isRouterHere()) { this.openMenu(); }
    this.updateWindowDimensions()
  }

  componentDidUpdate({ location: { state: prevRouterState} }) {
    const routerLocationJustChanged = this.hasRouterLocationJustChanged(prevRouterState);
    if (routerLocationJustChanged && this.isRouterHere()) { this.openMenu(); }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState(state => ({ ...state, width: window.innerWidth, height: window.innerHeight }));
  }

  onStartDragEvent({ clientX: x, clientY: y }, data) {
    console.log(x, y)
    const { menuPlacement: placement } = this.state;
    if (placement !== undefined) { this.animateUnDock(x, y) }
  }

  onDragEvent(e, { x, y }) {
    const { menuPlacement: placement, width } = this.state;

    if (y < 10) {
      if (placement !== 'willDockTop' ) this.setState(state => ({ ...state, menuPlacement: 'willDockTop' }))
    } else if (x < 10) {
      if (placement !== 'willDockLeft' ) this.setState(state => ({ ...state, menuPlacement: 'willDockLeft' }))
    } else if (x > (width - MENU_WIDTH - 10)) {
      if (placement !== 'willDockRight' ) this.setState(state => ({ ...state, menuPlacement: 'willDockRight' }))
    } else {
       if (placement !== undefined) this.setState(state => ({ ...state, menuPlacement: undefined }))
    }
  }

  onStopDragEvent(e, { x, y }) {
    const { menuPlacement: placement } = this.state;
    if (placement === 'willDockLeft') {
      this.animateDockLeft();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedLeft' }))
    }
    if (placement === 'willDockRight') {
      this.animateDockRight();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedRight' }))
    }
    if (placement === 'willDockTop') {
      this.animateDockTop();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedTop' }))
    }
  }

  isRouterHere() {
    const { location: { state } } = this.props;
    return state ? state.atLocation === 'view' : true; // is the router here with no modals in the way;
  }

  hasRouterLocationJustChanged(prevRouterState) {
    const { location: { state: currentRouterState} } = this.props;
    const currentAt = currentRouterState ? currentRouterState.atLocation : undefined;
    const prevAt = prevRouterState ? prevRouterState.atLocation : undefined;

    return currentAt !== prevAt
  }

  openMenu() {
    const { isOpen } = this.state;
    if (!isOpen) {
      this.setState({ isOpen: true });
      this.animateOpen();
    }
  }

  closeMenu() {
    const { isOpen } = this.state;
    if (isOpen) {
      this.setState({ isOpen: false });
      this.animateClose();
    }
  }

  animateOpen() {
    anime({
      targets: '.view-menu-container',
      height: [70, 500],
      width: `${MENU_WIDTH}px`,
      duration: 500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 100,
    })
  }

  animateClose() {
    anime({
      targets: '.view-menu-container',
      height: [500, 70],
      duration: 500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 100,
    })
  }

  animateUnDock(left, top) {
    anime({
      targets: '.view-menu-container',
      height: 500,
      width: 160,
      duration: 200,
      elasticity: 0,
      borderRadius: MENU_BORDER_RADIUS,
      easing: 'easeOutQuint',
      delay: 0,
    })
  }

  animateDockLeft() {
    anime({
      targets: '.view-menu-container',
      height: '100%',
      top: '0',
      left: '0',
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    })
  }

  animateDockTop() {
    anime({
      targets: '.view-menu-container',
      width: '100%',
      height: '70px',
      top: '0',
      left: '0px',
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    })
  }

  animateDockRight() {
    anime({
      targets: '.view-menu-container',
      height: '100%',
      top: '0',
      right: '0',
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    })
  }

  handleMenuOpenToggleClick() {
    const { isOpen } = this.state;
    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  render() {
    const { menuPlacement: placement, menuX, menuY, width } = this.state;
    let position
    switch(placement) {
      case 'hasDockedLeft': {
        position = { x: 0, y: 0 };
        break;
      }
      case 'hasDockedTop': {
        position = { x: 0, y: 0 };
        break;
      }
      case 'hasDockedRight': {
        position = { x: (width - MENU_WIDTH), y: 0 };
        break;
      }
    }

    const positionProp = position ? { position } : {};
    console.log(positionProp)
    console.log('placmenet', placement)
    return (
      <Container>
      <PlacementOutline shouldShow={placement === 'willDockLeft'} height="100vh" width={`${MENU_WIDTH}px`} top="0" left="0"/>
      <PlacementOutline shouldShow={placement === 'willDockRight'} height="100vh" width={`${MENU_WIDTH}px`} top="0" right="0"/>
      <PlacementOutline shouldShow={placement === 'willDockTop'} height="70px" width="100vw" top="0" left="0"/>
      <Draggable
        handle=".view-menu-draggable-handle"
        axis="both"
        bounds="parent"
        defaultPosition={{ x: 50, y: 70 }}
        onStart={this.onStartDragEvent}
        onDrag={this.onDragEvent}
        onStop={this.onStopDragEvent}
        {...positionProp}
      >
        <Menu className="view-menu-container here" menuPlacement={placement}>
          <MenuControllerContainer menuPlacement={placement}>
            <MenuDraggableContainer menuPlacement={placement} className='view-menu-draggable-handle'>
              <DraggableIcon />
              <DraggableIcon />
              <DraggableIcon />
            </MenuDraggableContainer>
            <MenuShrinkContainer menuPlacement={placement} onClick={this.handleMenuOpenToggleClick}>
              <MenuShrinkButton />
            </MenuShrinkContainer>
          </MenuControllerContainer>
          <RouterContainer menuPlacement={placement}>
            <FAIcon menuPlacement={placement} leftOrRight="left" className="fas fa-home" />
            <FAIcon menuPlacement={placement} leftOrRight="right" className="fas fa-question" />
          </RouterContainer>
        </Menu>
      </Draggable>
      </Container>
    );
  }
}
