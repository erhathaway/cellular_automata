import React from 'react';
import anime from 'animejs';
import Draggable from 'react-draggable';
import styled, { css } from 'react-emotion';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import Controls from './Controls';

const MENU_WIDTH = 160;
const UNDOCKED_MENU_HEIGHT = '600px';
const MENU_BORDER_RADIUS = '6px';
const DOCKED_VERTICAL_MENU_WIDTH = '160';
const DOCKED_HORIZONTAL_MENU_HEIGHT = '140';

const Container = styled('div')`
  height: 100vh;
  width: 100vw;
  z-index: 999;
`;

// dock top or bottom
const MenuHorizontal = css`
  flex-direction: row;
`;

// dock left or right
const MenuVertical = css`
  flex-direction: column;
`;

const MenuNotDocked = css`
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  border-radius: ${MENU_BORDER_RADIUS};
  border: 1px solid rgba(56,56,56,0.6);
  background-color: black;

`;

const Menu = styled('nav')`
  position: fixed;
  width: ${MENU_WIDTH}px;
  background-image: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.7), rgba(0,0,0,0.67), rgba(0,0,0,0.67), rgba(0,0,0,0.62));
  z-index: 3;
  display: flex;
  align-items: center;

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && MenuNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && MenuHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && MenuVertical)}
`;

// dock top or bottom
const ContentContainerHorizontal = css`
  flex-direction: row;
`;

// dock left or right
const ContentContainerVertical = css`
  flex-direction: column;
`;

const ContentContainerNotDocked = css`
  flex-direction: column;
`;

const ContentContainer = styled('div')`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: stretch;

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ContentContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ContentContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ContentContainerVertical)}
`;

const PlacementOutline = styled('nav')`
  position: fixed;
  ${({ left }) => left && `left: ${left};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ top }) => top && `top: ${top};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ width }) => width && `width: ${width};`}

  z-index: 1;
  background-color: rgba(94, 80, 80, 0.2);
  opacity: 1;
  opacity: ${({ shouldShow }) => (shouldShow ? 1 : 0)};
  ${({ shouldShow }) => (!shouldShow && 'display: none;')}

`;

class Component extends React.Component {
  static animateOpen() {
    anime({
      targets: '.view-menu-container',
      height: ['70px', UNDOCKED_MENU_HEIGHT],
      width: `${MENU_WIDTH}px`,
      duration: 500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 100,
    });
  }

  static animateClose() {
    anime({
      targets: '.view-menu-container',
      height: [UNDOCKED_MENU_HEIGHT, '70px'],
      duration: 500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 100,
    });
  }

  static animateUnDock() {
    anime({
      targets: '.view-menu-container',
      height: UNDOCKED_MENU_HEIGHT,
      width: 160,
      duration: 200,
      elasticity: 0,
      borderRadius: MENU_BORDER_RADIUS,
      easing: 'easeOutQuint',
      delay: 0,
    });
  }

  static animateDockLeft() {
    anime({
      targets: '.view-menu-container',
      height: '100%',
      top: '0',
      left: '0',
      width: `${DOCKED_VERTICAL_MENU_WIDTH}px`,
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    });
  }

  static animateDockTop() {
    anime({
      targets: '.view-menu-container',
      width: '100%',
      height: `${DOCKED_HORIZONTAL_MENU_HEIGHT}px`,
      top: '0',
      left: '0px',
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      isMenuMoving: false, // indicates whether the menu is undergoing a drag event or not
      isOpen: false,
      // eslint-disable-next-line max-len
      menuPlacement: undefined, // willDockTop, willDockLeft, willDockRight, hasDockedTop, hasDockedLeft, hasDockedRight
      width: undefined, // window.width
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
    this.updateWindowDimensions();
  }

  componentDidUpdate({ location: { state: prevRouterState } }) {
    const routerLocationJustChanged = this.hasRouterLocationJustChanged(prevRouterState);
    if (routerLocationJustChanged && this.isRouterHere()) { this.openMenu(); }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }


  onStartDragEvent({ clientX: x, clientY: y }) {
    const { menuPlacement: placement, isMenuMoving } = this.state;

    if (!isMenuMoving) { this.setState(state => ({ ...state, isMenuMoving: true })); }

    if (placement && placement.includes('Docked')) {
      this.setState(state => ({ ...state, menuPlacement: undefined }));
      Component.animateUnDock(x, y);
    }
  }

  onDragEvent(e, { x, y }) {
    const { menuPlacement: placement, width } = this.state;

    if (y < 10) {
      if (placement !== 'willDockTop') this.setState(state => ({ ...state, menuPlacement: 'willDockTop' }));
    } else if (x < 10) {
      if (placement !== 'willDockLeft') this.setState(state => ({ ...state, menuPlacement: 'willDockLeft' }));
    } else if (x > (width - MENU_WIDTH - 10)) {
      if (placement !== 'willDockRight') this.setState(state => ({ ...state, menuPlacement: 'willDockRight' }));
    } else if (placement !== undefined) this.setState(state => ({ ...state, menuPlacement: undefined })); // eslint-disable-line max-len
  }

  onStopDragEvent() {
    const { menuPlacement: placement, isMenuMoving } = this.state;

    if (isMenuMoving) { this.setState(state => ({ ...state, isMenuMoving: false })); }

    if (placement === 'willDockLeft') {
      Component.animateDockLeft();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedLeft' }));
    }
    if (placement === 'willDockRight' || placement === 'hasDockedRight') {
      this.animateDockRight();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedRight' }));
    }
    if (placement === 'willDockTop') {
      Component.animateDockTop();
      this.setState(state => ({ ...state, menuPlacement: 'hasDockedTop' }));
    }
  }

  updateWindowDimensions() {
    this.setState(state => ({ ...state, width: window.innerWidth, height: window.innerHeight }));
    this.onStopDragEvent(); // rerun stop event dockings in case screen size got changed
  }

  isRouterHere() {
    const { location: { state } } = this.props;
    return state ? state.atLocation === 'view' : true; // is the router here with no modals in the way;
  }

  hasRouterLocationJustChanged(prevRouterState) {
    const { location: { state: currentRouterState } } = this.props;
    const currentAt = currentRouterState ? currentRouterState.atLocation : undefined;
    const prevAt = prevRouterState ? prevRouterState.atLocation : undefined;

    return currentAt !== prevAt;
  }

  openMenu() {
    const { isOpen } = this.state;
    if (!isOpen) {
      this.setState({ isOpen: true });
      Component.animateOpen();
    }
  }

  closeMenu() {
    const { isOpen } = this.state;
    if (isOpen) {
      this.setState({ isOpen: false });
      Component.animateClose();
    }
  }

  animateDockRight() {
    const { width: screenWidth } = this.state;
    anime({
      targets: '.view-menu-container',
      height: '100%',
      width: `${DOCKED_VERTICAL_MENU_WIDTH}px`,
      top: '0px',
      borderRadius: 0,
      duration: 300,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 0,
      update: () => {
        const el = document.getElementById('view-menu-container');
        el.style.transform = `translate(${screenWidth - DOCKED_VERTICAL_MENU_WIDTH}px, 0px)`;
        el.style.left = 'unset';
      },
    });
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
    const {
      menuPlacement: placement,
      width,
      isOpen,
      isMenuMoving,
    } = this.state;

    let position;
    switch (placement) {
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
      } default: {
        break;
      }
    }

    const positionProp = position ? { position } : {};
    const { children } = this.props;
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { menuPlacement: placement, isMenuOpen: isOpen, isMenuMoving }));

    return (
      <Container>
        <PlacementOutline shouldShow={placement === 'willDockLeft'} height="100vh" width={`${DOCKED_VERTICAL_MENU_WIDTH}px`} top="0" left="0" />
        <PlacementOutline shouldShow={placement === 'willDockRight'} height="100vh" width={`${DOCKED_VERTICAL_MENU_WIDTH}px`} top="0" right="0" />
        <PlacementOutline shouldShow={placement === 'willDockTop'} height={`${DOCKED_HORIZONTAL_MENU_HEIGHT}px`} width="100vw" top="0" left="0" />
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
          <Menu id="view-menu-container" className="view-menu-container here" menuPlacement={placement}>
            <Controls menuPlacement={placement} />
            <ContentContainer menuPlacement={placement}>
              { childrenWithProps }
            </ContentContainer>
          </Menu>
        </Draggable>
      </Container>
    );
  }
}

Component.propTypes = {
  menuPlacement: PropTypes.string,
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

Component.defaultProps = {
  menuPlacement: undefined,
};

export default Component;
