import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';
import { Switch, Route } from 'react-router-dom';

import Doc from './Doc';
import SideBar from './SideBar';
import SideBarSection from './SideBarSection';

import { router as routerService } from '../../services';

import introductionDoc from '../../docs/what-is-a-automata.md';
import dimensionDoc from '../../docs/dimension.md';

const PAGES = [
  { displayName: 'Introduction', routerName: 'introduction', path: introductionDoc },
  { displayName: 'Dimension', routerName: 'dimension', path: dimensionDoc },
  { displayName: 'Dimension', routerName: 'dimension', path: dimensionDoc },
  { displayName: 'Dimension', routerName: 'dimension', path: dimensionDoc },
  { displayName: 'Dimension', routerName: 'dimension', path: dimensionDoc },

];

routerService.registerDocumentationPages(PAGES);

const Container = styled('div')`
  position: absolute;
  background-color: black;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1;
  overflow: none;
`;

const NavContainer = styled('div')`
  position: fixed;
  left: 150px;
  height: 100vh;
  display: flex;
  align-items: center;
`;

const DocContainer = styled('div')`
  height: 100%;
  width: 500px;
  padding-left: 150px;
  margin-left: 10px;
`;

const combineProps = (Scene, initialProps) => props => (
  <Scene {...initialProps} {...props} />
);

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
    const { location, history } = this.props;
    const documentationPage = routerService.getDocumentationPage(location);

    return (
      <Container className="doc doc-modal">
        <NavContainer className="doc-nav">
          <SideBar history={history}>
            { PAGES.map(({ routerName, displayName }) => (
              <SideBarSection
                isActive={documentationPage === routerName}
                routerName={routerName}
                displayName={displayName}
              />
            ))}
          </SideBar>
        </NavContainer>
        <DocContainer className="doc-container">
          <Switch location={location}>
            { PAGES.map(({ routerName, path }) => {
              if (documentationPage === routerName) {
                return <Route path="*" render={combineProps(Doc, { filePath: path })} />
              }
              return null
            })}
            <Route path="*" render={combineProps(Doc, { filePath: PAGES[0].path })} />
          </Switch>
        </DocContainer>
      </Container>
    );
  }
}
