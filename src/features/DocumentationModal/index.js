import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

import Doc from './Doc';
import SideBar from './SideBar';
import { router as routerService } from '../../services';

import doc from '../../docs/what-is-a-automata.md';

const Container = styled('div')`
  position: fixed;
  background-color: black;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const NavContainer = styled('div')`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DocContainer = styled('div')`
  width: 500px;
  height: 100%;
  margin-top: 10%;
  padding-left: 150px;
  margin-left: 10px;
`;

export default class Component extends React.Component {
  static animateIn() {
    if (routerService.isComingFromIntroModal()) {
      anime({
        targets: '.doc-modal',
        translateX: [1500, 0],
        opacity: [0, 1],
        duration: 1000,
        elasticity: 100,
        delay: 0,
        easing: 'easeOutQuint',
      });
    } else {
      anime({
        targets: '.doc-nav',
        translateX: [-200, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 100,
        delay: 0,
        easing: 'easeOutQuint',
      });

      anime({
        targets: '.doc-container',
        scale: [0.9, 1],
        opacity: [0.5, 1],
        duration: 1500,
        elasticity: 100,
        delay: 0,
        easing: 'easeOutQuint',
      });
    }
  }

  componentDidMount() {
    Component.animateIn();
  }

  componentWillUpdate({ inState }) {
    if (inState === 'exiting') { this.animateOut(); }
  }

  animateOut() {
    const { history: { location } } = this.props;
    const willShowDocumentationMoal = routerService.shouldShowIntroModal(location);

    if (willShowDocumentationMoal) {
      anime({
        translateX: [0, 900],
        targets: '.doc-modal',
        opacity: [1, 0],
        duration: 2000,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 0,
      });
    } else {
      anime({
        targets: '.doc-modal',
        translateY: [0, -600],
        translateX: [0, 600],
        opacity: [1, 0],
        duration: 1500,
        elasticity: 100,
        easing: 'easeOutQuint',
        delay: 400,
      });
    }
  }

  render() {
    return (
      <Container className="doc doc-modal">
        <NavContainer className="doc-nav">
          <SideBar />
        </NavContainer>
        <DocContainer className="doc-container">
          <Doc filePath={doc} />
        </DocContainer>
      </Container>
    );
  }
}
