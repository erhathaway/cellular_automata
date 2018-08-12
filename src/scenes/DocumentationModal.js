import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';
import { TransitionGroup, Transition } from 'react-transition-group';
import { Switch, Route } from 'react-router-dom';
import ReactRouterPropTypes from 'react-router-prop-types';

import uuid from 'uuid';

import {
  Page,
  PageMenu,
  SideBar,
  SideBarSection,
  ExitButton,
} from '../features/DocumentationModal';

import { router as routerService, locationHistory as locationHistoryService } from '../services';

import introductionDoc from '../docs/what-is-a-automata.md';
import dimensionDoc from '../docs/dimension.md';
import generationsDoc from '../docs/generations.md';
import stateDoc from '../docs/state.md';
import viewerDoc from '../docs/viewer.md';
import neighborsDoc from '../docs/neighbors.md';

const PAGES = [
  {
    id: uuid(), pageDisplayName: 'Introduction', pageRouterName: 'introduction', pagePath: introductionDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Dimensions', pageRouterName: 'dimension', pagePath: dimensionDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Generations', pageRouterName: 'generations', pagePath: generationsDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Viewer', pageRouterName: 'viewer', pagePath: viewerDoc,
  },
  {
    id: uuid(), pageDisplayName: 'Neighbors', pageRouterName: 'neighbors', pagePath: neighborsDoc,
  },
  {
    id: uuid(), pageDisplayName: 'State', pageRouterName: 'state', pagePath: stateDoc,
  },
];

routerService.registerDocumentationPages(PAGES);

const combineProps = (Scene, initialProps) => props => (
  <Scene {...initialProps} {...props} />
);

const Container = styled('div')`
  position: fixed;
  left: 0,
  top: 0,
  opacity: 1;
  background-color: rgba(0,0,0,0.9);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 2;
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
  position: static;
  width: 500px;
  padding-left: 150px;
  margin-left: 10px;
  overflow: hidden;
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

    if (locationHistoryLength > 1 && previousLocationName === 'intro') {
      anime({
        targets: '.doc-modal',
        translateX: [500, 0],
        opacity: [0, 1],
        duration: 1500,
        elasticity: 0,
        delay: 300,
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

  animateOut() {
    const { history: { location: { state } } } = this.props;
    const atLocationName = state ? state.atLocation : undefined;

    if (atLocationName === 'intro') {
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
          <TransitionGroup key="123">
            <Transition
              key={`doc-page-modal-transition-${selectedDocPage.pageRouterName}`}
              timeout={{
                enter: 500,
                exit: 0,
              }}
              unmountOnExit
            >
              {inState => (
                <Switch key="switch-1-key" location={{ ...location, pathname: `/${selectedDocPage.pageRouterName}` }}>
                  { PAGES.map(({ pagePath, pageRouterName }) => (
                    <Route path={`/${pageRouterName}`} key={`route-key-doc-page-${pageRouterName}`} render={combineProps(Page, { inState, filePath: pagePath })} />
                  ))}
                </Switch>
              )}
            </Transition>
          </TransitionGroup>
          <PageMenu history={history} />
        </DocContainer>
      </Container>
    );
  }
}

Component.propTypes = {
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
};

export default Component;