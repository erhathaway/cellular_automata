import React from 'react';
import anime from 'animejs';
import Draggable from 'react-draggable';
import styled, { css } from 'react-emotion';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';

import { menuStyling } from '../../services';

import Controls from './Controls';

const MENU_WIDTH = 160;
const UNDOCKED_MENU_HEIGHT = '600px';
const MENU_BORDER_RADIUS = '6px';
const DOCKED_VERTICAL_MENU_WIDTH = '160';
const DOCKED_HORIZONTAL_MENU_HEIGHT = '140';

const Container = styled('div')`
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  z-index: 0;
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
  border: 1px solid rgba(56,56,56,0.8);
  background-color: black;
`;

const styledMenuCreator = menuStyling({
  canDock: MenuNotDocked,
  undocked: MenuNotDocked,
  'docked-left': MenuVertical,
  'docked-right': MenuVertical,
  'docked-top': MenuHorizontal,
});

const Menu = styled('nav')`
  position: absolute;
  width: ${MENU_WIDTH}px;
  background-image: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.8), rgba(0,0,0,0.77), rgba(0,0,0,0.77), rgba(0,0,0,0.72));
  z-index: 3;
  display: flex;
  align-items: center;

  ${styledMenuCreator}
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

const styledContentContainerCreator = menuStyling({
  canDock: ContentContainerNotDocked,
  undocked: ContentContainerNotDocked,
  'docked-left': ContentContainerVertical,
  'docked-right': ContentContainerVertical,
  'docked-top': ContentContainerHorizontal,
});

const ContentContainer = styled('div')`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: stretch;

  ${styledContentContainerCreator}
`;

const PlacementOutline = styled('nav')`
  position: absolute;
  ${({ left }) => left && `left: ${left};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ top }) => top && `top: ${top};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ width }) => width && `width: ${width};`}

  z-index: 1;
  background-color: rgba(94, 80, 80, 0.2);
  // opacity: 1;
  opacity: ${({ shouldShow }) => (shouldShow ? 1 : 0)};
  ${({ shouldShow }) => (!shouldShow && 'display: none;')}

`;

class Component extends React.Component {
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
      width: undefined, // window.width
    };

    this.myRef = React.createRef();

    this.onStartDragEvent = this.onStartDragEvent.bind(this);
    this.onDragEvent = this.onDragEvent.bind(this);
    this.onStopDragEvent = this.onStopDragEvent.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentDidMount() {
    if (this.isRouterHere()) { this.animateIntro();; }
    this.updateWindowDimensions();
  }

  componentDidUpdate({ location: { state: prevRouterState } }) {
    const routerLocationJustChanged = this.hasRouterLocationJustChanged(prevRouterState);
    if (routerLocationJustChanged && this.isRouterHere()) { this.animateIntro();}
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }


  onStartDragEvent({ clientX: x, clientY: y }) {
    // mobx model data
    const { automataMenuStore: menu } = this.props;

    if (!menu.isMoving) { menu.turnIsMovingOn(); }

    if (menu.isDocked) {
      Component.animateUnDock(x, y);
      menu.setDockingState('undocked');
    }
  }

  onDragEvent(e, { x, y }) {
    const { width } = this.state;

    // mobx model data
    const { automataMenuStore: menu } = this.props;
    const { dockingState, placement: p } = menu;

    if (y < 10) {
      if (p !== 'top') menu.setPlacement('top');
      if (dockingState !== 'canDock') menu.setDockingState('canDock');
    } else if (x < 10) {
      if (p !== 'left') menu.setPlacement('left');
      if (dockingState !== 'canDock') menu.setDockingState('canDock');
    } else if (x > (width - MENU_WIDTH - 10)) {
      if (p !== 'right') menu.setPlacement('right');
      if (dockingState !== 'canDock') menu.setDockingState('canDock');
    } else {
      if (p !== 'floating') menu.setPlacement('floating');
      if (dockingState !== 'undocked') menu.setDockingState('undocked');
    }
  }

  onStopDragEvent() {
    // mobx model data
    const { automataMenuStore: menu } = this.props;
    const { placement: p, isMoving } = menu;

    if (isMoving) { menu.turnIsMovingOff() };

    if (menu.canDock) {
      if (p === 'left') {
        Component.animateDockLeft();
      } else if (p === 'right') {
        this.animateDockRight();
      } else if (p === 'top') {
        Component.animateDockTop();
      }
      menu.setDockingState('docked');
    }
  }

  updateWindowDimensions() {
    const { parentID } = this.props;
    const el = document.getElementById(parentID);
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      this.setState(state => ({ ...state, width, height }));
    }

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

  animateIntro() {
    const { automataMenuStore: menu } = this.props;

    if (menu.canDock) {
      this.onStopDragEvent(); // this will trigger a docking event based on the placement
    } else {
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

  render() {
    const { width } = this.state;
    const { automataMenuStore: menu, shouldPositionPopup } = this.props;

    const placement = menu.placementAndMenuState;
    const { placement: p, dockingState } = menu;

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
      React.cloneElement(child, {
        menuPlacement: placement,
        isMenuOpen: true,
        isMenuMoving: menu.isMoving,
        shouldPositionPopup,
      }));

    return (
      <Container>
        <PlacementOutline shouldShow={placement === 'canDockLeft'} height="100%" width={`${DOCKED_VERTICAL_MENU_WIDTH}px`} top="0" left="0" />
        <PlacementOutline shouldShow={placement === 'canDockRight'} height="100%" width={`${DOCKED_VERTICAL_MENU_WIDTH}px`} top="0" right="0" />
        <PlacementOutline shouldShow={placement === 'canDockTop'} height={`${DOCKED_HORIZONTAL_MENU_HEIGHT}px`} width="100%" top="0" left="0" />
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
          <Menu id="view-menu-container" className="view-menu-container here" placement={p} dockingState={dockingState}>
            <Controls menuPlacement={placement} />
            <ContentContainer placement={p} dockingState={dockingState}>
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

export default inject('automataMenuStore')(observer(Component));
