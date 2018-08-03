import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';
import { Switch, Route } from 'react-router-dom';
import { TransitionGroup, Transition } from 'react-transition-group';
import uuid from 'uuid';

import Doc from './Doc';
import SideBar from './SideBar';
import SideBarSection from './SideBarSection';

import { router as routerService } from '../../services';

import introductionDoc from '../../docs/what-is-a-automata.md';
import dimensionDoc from '../../docs/dimension.md';

const PAGES = [
  { id: uuid(), pageDisplayName: 'Introduction', pageRouterName: 'introduction', pagePath: introductionDoc },
  { id: uuid(), pageDisplayName: 'Dimension', pageRouterName: 'dimension', pagePath: dimensionDoc },
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
    const selectedDocPage = routerService.getSelectedDocumentationPage(location);
    const duration = 200;

    return (
      <Container className="doc doc-modal">
        <NavContainer className="doc-nav">
          <SideBar history={history}>
            { PAGES.map(({ pageRouterName, pageDisplayName }) => (
              <SideBarSection
                key={`doc-nav-${pageRouterName}`}
                isSelected={selectedDocPage === pageRouterName}
                pageRouterName={pageRouterName}
                pageDisplayName={pageDisplayName}
              />
            ))}
          </SideBar>
        </NavContainer>
        <DocContainer className="doc-container">
          <TransitionGroup>
            { PAGES.filter(page => page.pageRouterName === selectedDocPage).map(({ id, pageRouterName, pagePath }) => (
              <Transition key={id} timeout={duration}>
                { inState => <Doc inState={inState} isSelected={selectedDocPage === pageRouterName} filePath={pagePath} />  }
              </Transition>
            ))
            }
          </TransitionGroup>
        </DocContainer>
      </Container>
    );
  }
}

// <Transition
//   key={'documentation-view-transition-key'}
//   timeout={duration}
// >
//   { inState => (
//     <div>
//       <Doc key={`doc-view-${PAGES[0].pageRouterName}`} inState={inState} isSelected={selectedDocPage === PAGES[0].pageRouterName} filePath={PAGES[0].pagePath} />
//       <Doc key={`doc-view-${PAGES[1].pageRouterName}`} inState={inState} isSelected={selectedDocPage === PAGES[1].pageRouterName} filePath={PAGES[1].pagePath} />
//     </div>
//   )}
// </Transition>
// { inState => () }

// { PAGES.map(({ pageRouterName, pagePath }) => <Doc inState={inState} isSelected={selectedDocPage === pageRouterName} filePath={pagePath} />) }

// <div location={location}>
// </div>

// { PAGES.map(({ pageRouterName, pagePath }) => (
//   <Route
//     key={`doc-view-${pageRouterName}`}
//     path="*"
//     children={({ match, ...rest }) => ( // eslint-disable-line react/no-children-prop, max-len
//       <Doc inState={inState} isSelected={selectedDocPage === pageRouterName} filePath={pagePath} match={match} {...rest} />
//     )}
//   />
// ))}
// <Route key={`doc-view-undefined`}path="*" render={combineProps(Doc,{ inState })} />

// { PAGES.map(({ pageRouterName, pagePath }) => {
//     return <Route key={`doc-view-${pageRouterName}`} path="*" params={{ docPage: pageRouterName }}render={combineProps(Doc, { inState, filePath: pagePath })} />
//
// })}
// <Route key={`doc-view-undefined`}path="*" render={combineProps(Doc,{ inState })} />

// <Route path="*" render={combineProps(Doc, { filePath: PAGES[0].pagePath })} />

// { selectedDocPage === PAGES[0].pageRouterName && <Route key={`doc-view-${PAGES[0].pageRouterName}`} path="*" render={combineProps(Doc, { inState, filePath: PAGES[0].pagePath })} />}
// { selectedDocPage === PAGES[1].pageRouterName && <Route key={`doc-view-${PAGES[1].pageRouterName}`} path="*" render={combineProps(Doc, { inState, filePath: PAGES[1].pagePath })} />}
