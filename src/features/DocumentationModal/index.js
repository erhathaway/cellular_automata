import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';
import { TransitionGroup, Transition } from 'react-transition-group';
import uuid from 'uuid';

import Page from './Page';
import PageMenu from './PageMenu';
import SideBar from './SideBar';
import SideBarSection from './SideBarSection';
import ExitButton from './ExitButton';

import { router as routerService } from '../../services';

import introductionDoc from '../../docs/what-is-a-automata.md';
import dimensionDoc from '../../docs/dimension.md';
import stateDoc from '../../docs/state.md';
import viewerDoc from '../../docs/viewer.md';
import neighborsDoc from '../../docs/neighbors.md';

const PAGES = [
  {
    id: uuid(), pageDisplayName: 'Introduction', pageRouterName: 'introduction', pagePath: introductionDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Dimensions', pageRouterName: 'dimension', pagePath: dimensionDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Neighbors', pageRouterName: 'neighbors', pagePath: neighborsDoc,
  },
  {
    id: uuid(), pageDisplayName: 'State', pageRouterName: 'state', pagePath: stateDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Viewer', pageRouterName: 'viewer', pagePath: viewerDoc,
  },
];

routerService.registerDocumentationPages(PAGES);

const Container = styled('div')`
  position: relative;
  background-color: black;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1;
  overflow-y: scroll;
  height: 100vh;

`;

const NavContainer = styled('div')`
  position: fixed;
  left: 150px;
  height: 80vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 10vh;
`;

const DocContainer = styled('div')`
  position: relative;
  width: 500px;
  padding-left: 150px;
  margin-left: 10px;
  overflow: hidden;
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
    const selectedDocPage = routerService.getSelectedDocumentationPage(location);
    const duration = 500;

    return (
      <Container className="doc doc-modal">
        <NavContainer className="doc-nav">
          <ExitButton history={history} />
          <SideBar history={history}>
            { PAGES.map(({ pageRouterName, pageDisplayName }) => (
              <SideBarSection
                key={`doc-nav-${pageRouterName}`}
                isSelected={selectedDocPage.pageRouterName === pageRouterName}
                pageRouterName={pageRouterName}
                pageDisplayName={pageDisplayName}
              />
            ))}
          </SideBar>
        </NavContainer>
        <DocContainer className="doc-container">
          { PAGES.filter(page => page.pageRouterName === selectedDocPage.pageRouterName).map(({ id, pagePath }) => ( // eslint-disable-line max-len
            <Transition key={id} timeout={duration}>
              { inState => (
                <Page
                  inState={inState}
                  filePath={pagePath}
                />)
              }
            </Transition>
          ))
          }
          <PageMenu history={history} />
        </DocContainer>
      </Container>
    );
  }
}
