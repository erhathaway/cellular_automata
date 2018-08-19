import React from 'react';
import styled from 'react-emotion';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, Transition } from 'react-transition-group';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Provider, inject, observer } from 'mobx-react';

// State
import {
  AutomataStateStore,
  AutomataMenuStore,
  DeviceStateStore,
  SceneModalsAndMenusStore,
  RouterStore,
} from '../state';

// Services
import { router as routerService, locationHistory } from '../services';

// CSS
import './main.css';

// Scenes
import MainNav from './MainNav';
import DocumentationModal from './DocumentationModal';
import IntroModal from './IntroModal';
import ViewScene from './View';
import ExploreScene from './Explore';

// ------------------------------------------------
// Record router history and save on History Object
// ------------------------------------------------
// treats all router location changes as a continual movement forward in history
//  regardless if the backbutton is used
//  this allows us to use the routerService.locationHistory to accurately tell where we came from
class LocationHistoryRecorder extends React.Component {
  componentWillUpdate({ history: newHistory }) {
    const { location: newLocation } = newHistory;

    const { location: currentLocation, routerStore } = this.props;
    if (routerService.hasLocationChanged(newLocation, currentLocation)) {
      routerStore.updateLocation(newHistory.location);
    }
  }
  // shouldComponentUpdate({ history: newHistory }) {
  //   const { location: currentLocation, routerStore } = this.props;
  //   const { location: newLocation } = newHistory;
  //
  //   if (routerService.hasLocationChanged(newLocation, currentLocation)) {
  //     locationHistory.addLocation(currentLocation);
  //     const from = routerService.previousLocationName();
  //     const at = routerService.getLocationName(newLocation);
  //     routerService.updateStateHistory(newHistory, from, at);
  //     routerStore.rootRouter.updateLocation(newLocation)
  //     return false;
  //   }
  //   return true;
  // }

  render() {
    const { children } = this.props;
    return children;
  }
}

LocationHistoryRecorder.propTypes = {
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  children: PropTypes.element.isRequired,
};

const LocationHistoryRecorderWithMobx = inject('routerStore')(observer(LocationHistoryRecorder));


const Container = styled('div')`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: ${({ orientation }) => (orientation === 'landscape' ? 'row' : 'column')};
`;

const combineProps = (Scene, initialProps) => props => (
  <Scene {...initialProps} {...props} />
);

const duration = 1000;

// ------------------------------------------------
// Interpret router query string and router user to correct modals / scenes
// ------------------------------------------------
const QueryStringHandler = ({ location, history, deviceStateStore: device, routerStore }) => {
  const modal = routerStore.topOfStack;
  return (
    <Container id="query-string-handler-container" orientation={device.orientation}>
      <MainNav history={history} />

      <TransitionGroup>
        <Transition
          key={`modal-transition-${modal}`}
          timeout={{
            enter: 500,
            exit: 600,
          }}
        >
          {inState => (
            <Switch key="switch-1-key" location={{ ...location, pathname: `/${modal}` }}>
              <Route path="/doc" key="route-key-doc-modal" render={combineProps(DocumentationModal, { inState, transitionDuration: duration })} />
              <Route path="/intro" key="route-key-intro-modal" render={combineProps(IntroModal, { inState, transitionDuration: duration })} />
            </Switch>
          )}
        </Transition>
      </TransitionGroup>
      <Switch key="switch-2-key" location={location}>
        <Route path="/explore" component={ExploreScene} />
        <Route path="*" component={ViewScene} />
      </Switch>
    </Container>

  );
};

QueryStringHandler.propTypes = {
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
};

const QueryStringHandlerWithMobx = inject('deviceStateStore', 'routerStore')(observer(QueryStringHandler));

// ------------------------------------------------
// Main route composition
// ------------------------------------------------
const MainRoute = props => (
  <LocationHistoryRecorderWithMobx {...props}>
    <QueryStringHandlerWithMobx {...props} />
  </LocationHistoryRecorderWithMobx>
);

export default () => (
  <BrowserRouter>
    <Provider
      automataStore={AutomataStateStore}
      automataMenuStore={AutomataMenuStore}
      deviceStateStore={DeviceStateStore}
      sceneModalsAndMenusStore={SceneModalsAndMenusStore}
      routerStore={RouterStore}
    >
      <Route path="*" component={MainRoute} />
    </Provider>
  </BrowserRouter>
);
