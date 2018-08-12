import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';
import ReactRouterPropTypes from 'react-router-prop-types';

import { locationHistory as locationHistoryService } from '../services';

import {
  Title,
  Images,
  Description,
  Start,
  OrDivider,
  LearnMore,
  Credits,
} from '../features/IntroModal';

const Container = styled('div')`
  position: fixed;
  left: 0,
  top: 0,
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1;
`;

const Middle = styled('div')`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 700px;

  @media (max-width: 900px) {
    width: 80%;
    min-width: 300px;
    max-width: 700px;
  }

  @media (max-width: 320px) {
    width: 300px;
  }
`;

const Bottom = styled('div')`
  position: relative;
  bottom: 0px;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  height: 65px;
  margin-right: 80px;

  @media (max-width: 420px) {
    justify-content: center;
    margin-right: 0px;
  }
`;

class Component extends React.Component {
  componentDidMount() {
    this.animateIn();
  }

  componentWillUpdate({ inState }) {
    if (inState === 'exiting') { this.animateOut(); }
  }

  animateIn() {
    const { history: { location: { state } } } = this.props;
    const previousLocationName = state ? state.fromLocation : undefined;
    const locationHistoryLength = locationHistoryService.history.length;

    if (locationHistoryLength > 1 && previousLocationName === 'documentation') {
      anime({
        targets: '.intro-modal',
        translateX: [-500, 0],
        opacity: [0, 1],
        duration: 1000,
        elasticity: 100,
        easing: 'easeOutQuint',
      });
    } else {
      anime({
        targets: '.intro-modal.in',
        top: [-500, 0],
        left: [-300, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 100,
        scale: [0, 1],
        easing: 'easeOutQuint',
      });

      anime({
        targets: '.intro-modal.stagger-in-bottom',
        bottom: [-300, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 600,
      });

      anime({
        targets: '.intro-modal.delay-appear-in',
        top: [300, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 500,
      });

      anime({
        targets: '.intro-modal.credits',
        right: [-300, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 1500,
      });
    }
  }

  animateOut() {
    const { history: { location: { state } } } = this.props;
    const goingToLocationName = state ? state.atLocation : undefined;

    if (goingToLocationName === 'documentation') {
      anime({
        translateX: [0, -900],
        targets: '.intro-modal',
        opacity: [1, 0],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 0,
      });
    } else {
      anime({
        targets: '.intro-modal',
        translateY: [0, -600],
        translateX: [0, 600],
        opacity: [1, 0],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 0,
      });
    }
  }

  render() {
    const { history } = this.props;
    return (
      <Container>
        <Middle>
          <Title className="intro-modal in" marginTop="0px" marginBottom="10px" />
          <Images className="intro-modal in" marginBottom={100} />
          <Description className="intro-modal delay-appear-in" marginTop="45px" marginBottom="120px" />
          <Start className="intro-modal stagger-in-bottom" history={history} marginTop="0px" marginBottom="0px" />
          <OrDivider className="intro-modal stagger-in-bottom" marginTop="15px" marginBottom="0px" />
          <LearnMore className="intro-modal stagger-in-bottom" history={history} marginTop="0px" marginBottom="0px" />
        </Middle>
        <Bottom className="intro-modal credits">
          <Credits className="intro-modal credits" />
        </Bottom>
      </Container>
    );
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default Component;