import queryString from 'query-string';

class LocationHistory {
  constructor() {
    this.history = [];
  }

  lastLocation() {
    return this.history.splice(-1)[0];
  }

  addLocation(location) {
    this.history.push(location);
  }
}

const locationHistory = new LocationHistory();

const router = {
  /* NAV */

  navToView(history) {
    history.push({ pathname: '/view', search: '?intro=true', state: { hideIntro: true } });
    locationHistory.addLocation(history.location);
  },
  navToDocumentation(history) {
    history.push({ pathname: '/view', search: '?documentation=true', state: { hideIntro: true } });
    locationHistory.addLocation(history.location);
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
    console.log(lastLocation)
    if (lastLocation && this.shouldShowDocumentationModal(lastLocation)) {
      console.log('is coming: true')

      return true;
    }
    console.log('is coming: false')
    return false;
  }
};

export default router;
