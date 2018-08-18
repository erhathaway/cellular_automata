import React from 'react';
import styled, { css } from 'react-emotion';
import { inject, observer } from 'mobx-react';
import anime from 'animejs';

const PortraitContainer = css`
  height: 180px;
  width: 100%;
  flex-direction: row;
`;

const LandscapeContainer = css`
  height: 100%;
  width: 180px;

  flex-direction: column;
`;

const Container = styled('aside')`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  ${({ orientation }) => (orientation === 'landscape' ? LandscapeContainer : PortraitContainer)}
`;

const Padding = styled('div')`
  // background-color: brown;
  height: calc(100% - 40px);
  width: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  flex-direction: ${({ orientation }) => (orientation === 'landscape' ? 'column-reverse' : 'row')};
`;

class Component extends React.Component {
  componentDidMount() {
    this.animateIn();
  }

  componentWillUpdate({ transitionState: newTransitionState }) {
    const { transitionState: currentTransitionstate } = this.props;

    if (newTransitionState !== currentTransitionstate && newTransitionState === 'exiting') {
      this.animateOut();
    }
  }

  animateIn() {
    const { deviceStateStore: device } = this.props;
    const orientation = device.orientation === 'landscape' ? { width: [0, 180] } : { height: [0, 180] };

    anime({
      targets: '.my-automata',
      ...orientation,
      opacity: [0, 1],
      duration: 500,
      elasticity: 100,
      delay: 0,
      easing: 'easeOutQuint',
    });
  }

  animateOut() {
    const { deviceStateStore: device } = this.props;
    const orientation = device.orientation === 'landscape' ? { width: [180, 0] } : { height: [180, 0] };

    anime({
      targets: '.my-automata',
      ...orientation,
      opacity: [1, 0],
      duration: 500,
      elasticity: 100,
      delay: 0,
      easing: 'easeOutQuint',
    });
  }

  render()  {
    const {
      children,
      history,
      deviceStateStore: device,
      sceneModalsAndMenusStore: menus,
      ...props,
    } = this.props;

    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { history }));
    return (
      <Container className="my-automata" orientation={device.orientation}>
        <Padding orientation={device.orientation}>
          { childrenWithProps }
        </Padding>
      </Container>
    );
  }

};


export default inject('deviceStateStore', 'sceneModalsAndMenusStore')(observer(Component));
