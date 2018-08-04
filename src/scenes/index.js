import React from 'react';
import styled from 'react-emotion';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, Transition } from 'react-transition-group';

import { router as routerService, locationHistory } from '../services';

import './main.css';
import { IntroModal, DocumentationModal } from '../features';
import ViewScene from './View';
import ExploreScene from './Explore';

// treats all router location changes as a continual movement forward in history
//  regardless if the backbutton is used
//  this allows us to use the routerService.locationHistory to accurately tell where we came from
class LocationHistoryRecorder extends React.Component {
  componentWillUpdate({ history: { location: newLocation } }) {
    const { location: currentLocation } = this.props;

    if (JSON.stringify(currentLocation) !== JSON.stringify(newLocation)) {
      locationHistory.addLocation(currentLocation);
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

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


const MainRoute = (props) => (
  <LocationHistoryRecorder {...props}>
    <QueryStringHandler {...props}/>
  </LocationHistoryRecorder>
)

export default () => {
  return (
    <BrowserRouter>
        <Route path="*" component={MainRoute} />
    </BrowserRouter>
  );
};
