import React from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';
import Draggable from 'react-draggable';

// import Container from './Container';

import styled from 'react-emotion';

const MENU_WIDTH = 160;

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
  border-radius: 11px;
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

const MenuControllerContainer = styled('div')`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35px;
`;

const MenuDraggableHandle = styled('div')`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex: 2;
  background-color: rgba(54, 149, 217, 0.7);
  border-top-left-radius: 11px;

  &:hover {
    cursor: grab;
  }
`

const HandleIcon = styled('div')`
  background-color: gray;
  border-radius: 50%;
  height: 10px;
  width: 10px;
  margin: 5px;
`;

const MenuShrinkContainer = styled('div')`
  width: 70px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(54, 149, 217, 1);
  border-top-right-radius: 11px;

  &:hover {
    cursor: pointer;
  }
`;

const MenuShrinkButton = styled('div')`
  width: 25px;
  background-color: gray;
  height: 4px;
  border-radius: 2px;
  margin: 20px;
`;


export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      showPlacementOutline: undefined, // willDockTop, willDockLeft, willDockRight, hasDockedTop, hasDockedLeft, hasDockedRight
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
    const { showPlacementOutline: placement } = this.state;
    if (placement !== undefined) { this.animateUnDock(x, y) }
  }

  onDragEvent(e, { x, y }) {
    const { showPlacementOutline: placement, width } = this.state;

    if (y < 10) {
      if (placement !== 'willDockTop' ) this.setState(state => ({ ...state, showPlacementOutline: 'willDockTop' }))
    } else if (x < 10) {
      if (placement !== 'willDockLeft' ) this.setState(state => ({ ...state, showPlacementOutline: 'willDockLeft' }))
    } else if (x > (width - MENU_WIDTH - 10)) {
      if (placement !== 'willDockRight' ) this.setState(state => ({ ...state, showPlacementOutline: 'willDockRight' }))
    } else {
       if (placement !== undefined) this.setState(state => ({ ...state, showPlacementOutline: undefined }))
    }
  }

  onStopDragEvent(e, { x, y }) {
    const { showPlacementOutline: placement } = this.state;
    if (placement === 'willDockLeft') {
      this.animateDockLeft();
      this.setState(state => ({ ...state, showPlacementOutline: 'hasDockedLeft' }))
    }
    if (placement === 'willDockRight') {
      this.animateDockRight();
      this.setState(state => ({ ...state, showPlacementOutline: 'hasDockedRight' }))
    }
    if (placement === 'willDockTop') {
      this.animateDockTop();
      this.setState(state => ({ ...state, showPlacementOutline: 'hasDockedTop' }))
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
      borderRadius: 16,
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
      left: '0',
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
    const { showPlacementOutline: placement, menuX, menuY, width } = this.state;
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
        <Menu className="view-menu-container">
          <MenuControllerContainer>
            <MenuDraggableHandle className='view-menu-draggable-handle'>
              <HandleIcon />
              <HandleIcon />
              <HandleIcon />
            </MenuDraggableHandle>
            <MenuShrinkContainer onClick={this.handleMenuOpenToggleClick}>
              <MenuShrinkButton />
            </MenuShrinkContainer>
          </MenuControllerContainer>
        </Menu>
      </Draggable>
      </Container>
    );
  }
}
