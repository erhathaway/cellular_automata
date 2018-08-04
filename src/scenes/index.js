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
  shouldComponentUpdate({ history: newHistory }) {
    const { location: currentLocation } = this.props;
    const { location: newLocation } = newHistory;

    if (routerService.hasLocationChanged(newLocation, currentLocation)) {
      locationHistory.addLocation(currentLocation);
      const from = routerService.previousLocationName();
      const at = routerService.getLocationName(newLocation);
      routerService.updateStateHistory(newHistory, from, at);
      return false
    }
    // console.log('from:', newHistory.location.state.fromLocation)
    // console.log('at:', newHistory.location.state.atLocation)

    return true
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

const renderMe = (Scene, initialProps) =>  (
  <Scene {...initialProps}/>
);


const duration = 1000;

const QueryStringHandler = ({ location, history }) => {
  const showDocumentation = routerService.isShowingDocumentationModal(history.location);
  const showIntro = routerService.isShowingIntroModal(history.location);
  console.log('showintro', showIntro, "\n", 'showdoc', showDocumentation);

  const atLocation = history.location.state ? history.location.state.atLocation : 'intro';
  // console.log('at loc', atLocation)
  return (
    <Container>
      <TransitionGroup>
        <Transition
          key={`modal-transition-${atLocation}`}
          timeout={duration}
        >
          {inState => (
            <Switch key="567890" location={location}>
              { showDocumentation && <Route path="*" key="1234" render={combineProps(DocumentationModal, { inState, transitionDuration: duration })} />}
              { showIntro && <Route path="*" key="4567" render={combineProps(IntroModal, { inState, transitionDuration: duration })} />}
            </Switch>
          )}
        </Transition>
      </TransitionGroup>
      <Switch key="123" location={location}>
        <Route path="/explore" component={ExploreScene} />
        <Route path="*" component={ViewScene} />
      </Switch>
    </Container>
  );
};


// <Container>
//   <TransitionGroup>
//       <Transition
//         key={location.key}
//         timeout={duration}
//         in={showDocumentation}
//       >
//         { inState => showDocumentation && <DocumentationModal history={history} location={location} inState={inState} transitionDuration={duration} /> }
//       </Transition>
//       <Transition
//         key={location.key+'1'}
//         timeout={duration}
//         in={showIntro}
//       >
//         { inState => showIntro && <IntroModal history={history} location={location} inState={inState} transitionDuration={duration} /> }
//       </Transition>
//   </TransitionGroup>
//   <Switch>
//     <Route path="/explore" component={ExploreScene} />
//     <Route path="*" component={ViewScene} />
//   </Switch>
// </Container>


// <Container>
//   <TransitionGroup>
//     <Transition
//       key={location.key}
//       timeout={duration}
//     >
//       {inState => (
//         <Switch key="switch-1-key" location={{ ...location, pathname: `/${atLocation}` }}>
//           <Route path="/documentation" key="1234" render={combineProps(DocumentationModal, { inState, transitionDuration: duration })} />
//           <Route path="/intro" key="4567" render={combineProps(IntroModal, { inState, transitionDuration: duration })} />
//         </Switch>
//       )}
//     </Transition>
//   </TransitionGroup>
//   <Switch key="switch-2-key" location={location}>
//     <Route path="/explore" component={ExploreScene} />
//     <Route path="*" component={ViewScene} />
//   </Switch>
// </Container>

// <Container>
//   <TransitionGroup>
//     {
//       [{ scene: DocumentationModal, show: showDocumentation }, { scene: IntroModal, show: showIntro }].map(({ scene, show }) => {
//         if (show) return (
//           <Transition
//             key={location.pathname}
//             timeout={duration}
//             in={show}
//           >
//             {
//               (inState) => renderMe(scene, { inState, history, location, transitionDuration: duration })
//             }
//           </Transition>
//         )
//         return null;
//       })
//     }
//   </TransitionGroup>
//   <Switch>
//     <Route path="/explore" component={ExploreScene} />
//     <Route path="*" component={ViewScene} />
//   </Switch>
// </Container>








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
