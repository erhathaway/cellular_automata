import React from 'react';
import styled from 'react-emotion';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, Transition } from 'react-transition-group';

import { router as routerService, locationHistory } from '../services';

import './main.css';
import { IntroModal, DocumentationModal } from '../features';
import ViewScene from './View';
import ExploreScene from './Explore';

// class LocationHistoryComponent extends React.Component {
//   componentWillReceiveProps() {
//     const { location } = this.props;
//     console.log('reciveing props')
//     locationHistory.addLocation(location);
//   }
// }

const Container = styled('div')`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const combineProps = (Scene, initialProps) => props => (
  <Scene {...initialProps} {...props} />
);

const duration = 1000;

const QueryStringHandler = ({ location, history }) => {
  const showDocumentation = routerService.shouldShowDocumentationModal(history.location);
  const showIntro = routerService.shouldShowIntroModal(history.location);

  return (
    <Container>
      <TransitionGroup>
        <Transition
          key={location.pathname}
          timeout={duration}
        >
          {inState => (
            <Switch location={location}>
              { showDocumentation && <Route path="*" render={combineProps(DocumentationModal, { inState, transitionDuration: duration })} />}
              { showIntro && <Route path="*" render={combineProps(IntroModal, { inState, transitionDuration: duration })} />}
            </Switch>
          )}
        </Transition>
      </TransitionGroup>
      <Switch>
        <Route path="/explore" component={ExploreScene} />
        <Route path="*" component={ViewScene} />
      </Switch>
    </Container>
  );
};


export default () => {
  return (
    <BrowserRouter>
      <Route path="*" component={QueryStringHandler} />
    </BrowserRouter>
  );
};
