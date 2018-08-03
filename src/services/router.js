import queryString from 'query-string';

class LocationHistory {
  constructor() {
    this.history = [];
  }

  lastLocation() {
    return this.history.splice(-1)[0];
  }

  addLocation(location) {
    this.history.push({ ...location });
  }
}

const locationHistory = new LocationHistory();

const router = {
  logRouting(location)  {
    locationHistory.addLocation(location);
  },
  /* NAV */

  navToView(history) {
    this.logRouting(history.location);
    history.push({ pathname: '/view', search: '?intro=true', state: { hideIntro: true } });
  },
  navToDocumentation(history) {
    this.logRouting(history.location);
    history.push({ pathname: '/view', search: '?documentation=true', state: { hideIntro: true } });
  },

  /* CURRENT LOCATION */
  shouldShowDocumentationModal(location) {
    const parsedQuery = queryString.parse(location.search, { decode: true });
    const showDocumentation = parsedQuery.documentation === 'true';
    return showDocumentation;
  },
  shouldShowIntroModal(location) {
    const parsedQuery = queryString.parse(location.search, { decode: true });

    const hideIntro = (location && location.state && location.state.hideIntro === true) || false; // eslint-disable-line max-len
    const showIntro = !hideIntro && (parsedQuery.intro === 'true' || !parsedQuery.intro);

    return showIntro;
  },
  isRoutingToView(history) {

  },
  isRoutingToExplore(history) {

  },
  /* PREIVOUS LOCATION */
  isComingFromDocumentationModal() {
    const lastLocation = locationHistory.lastLocation();
    console.log('from doc', lastLocation)
    if (lastLocation && this.shouldShowDocumentationModal(lastLocation)) { return true; }
    return false;
  },
  isComingFromIntroModal() {
    const lastLocation = locationHistory.lastLocation();
    if (lastLocation && this.shouldShowIntroModal(lastLocation)) { return true; }
    return false;
  }
};

export { router, locationHistory };
