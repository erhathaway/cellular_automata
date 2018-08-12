import queryString from 'query-string';

class LocationHistory {
  constructor() {
    this.history = [{ pathname: '/', search: '', state: {} }];
    this.maxHistoryLength = 100;
  }

  lastLocation() {
    this.history = this.history.slice(-this.maxHistoryLength);
    return this.history.slice(-1)[0];
  }

  addLocation(location) {
    if (JSON.stringify(this.lastLocation()) !== JSON.stringify(location)) {
      this.history.push({ ...location });
    }
  }
}

const locationHistory = new LocationHistory();

const router = {
  /* ------------------------ */
  /* UTILITIES */
  /* ------------------------ */

  updateLocationToCloseModals(location) {
    // hide intro in state field
    const newState = { ...location.state };
    newState.hideIntro = true;

    // remove modal info from query string
    const parsedQuery = queryString.parse(location.search, { decode: true });
    delete parsedQuery.modal;
    delete parsedQuery.docPage;

    // create new location object
    const newLocation = { ...location };
    newLocation.search = queryString.stringify(parsedQuery);
    newLocation.state = newState;

    return newLocation;
  },
  addToQueryString(exitingQueryString, objs) {
    const parsedQuery = queryString.parse(exitingQueryString, { decode: true });
    const newQuery = { ...parsedQuery, ...objs };
    return queryString.stringify(newQuery);
  },
  getLocationName(location) {
    if (this.isShowingIntroModal(location)) { return 'intro'; }
    if (this.isShowingDocumentationModal(location)) { return 'documentation'; }
    if (this.isAtView(location)) { return 'view'; }
    if (this.isAtExplore(location)) { return 'explore'; }
    return 'view';
  },
  extractRelevantInfoFromLocationForChangeComparison(location) {
    return {
      pathname: location.pathname,
      search: location.search,
      state: { ...location.state, fromLocation: undefined, atLocation: undefined },
    };
  },

  /* ------------------------ */
  /* History */
  /* ------------------------ */
  updateStateHistory(history, from, at) {
    const updatedLocation = { ...history.location };
    updatedLocation.state = { ...updatedLocation.state, fromLocation: from, atLocation: at };
    history.replace(updatedLocation); // use 'replace' instead of 'push' to prevent rerender
  },
  hasLocationChanged(newLocation, oldLocation) {
    const newLoc = this.extractRelevantInfoFromLocationForChangeComparison(newLocation);
    const oldLoc = this.extractRelevantInfoFromLocationForChangeComparison(oldLocation);
    return JSON.stringify(newLoc) !== JSON.stringify(oldLoc);
  },

  /* ------------------------ */
  /* NAV */
  /* ------------------------ */

  navToView(history) {
    const newLocation = this.updateLocationToCloseModals(history.location);
    history.push({ pathname: '/view', search: newLocation.search, state: newLocation.state });
  },
  navToExplore(history) {
    const newLocation = this.updateLocationToCloseModals(history.location);
    history.push({ pathname: '/explore', search: newLocation.search, state: newLocation.state });
  },
  openIntroModal(history) {
    const newLocation = this.updateLocationToCloseModals(history.location);
    const newSearch = this.addToQueryString(newLocation.search, { modal: 'intro' }); // modals are shown via the 'modal' field in the query string
    history.push({ // pass on all pathname and state info
      pathname: newLocation.pathname,
      search: newSearch,
      state: newLocation.state,
    });
  },
  openDocumentationModalPage(history, pageRouterName) {
    const newLocation = this.updateLocationToCloseModals(history.location);
    const newSearch = this.addToQueryString(newLocation.search, { modal: 'documentation', docPage: pageRouterName }); // modals are shown via the 'modal' field in the query string
    history.push({ // pass on all pathname and state info
      pathname: newLocation.pathname,
      search: newSearch,
      state: newLocation.state,
    });
  },
  closeModal(history) {
    const newLocation = this.updateLocationToCloseModals(history.location);
    history.push(newLocation);
  },

  /* ------------------------ */
  /* CURRENT LOCATION */
  /* ------------------------ */
  isAtView(location) {
    if (this.isShowingModal(location)) return false;

    return location.pathname === '/view';
  },
  isAtExplore(location) {
    if (this.isShowingModal(location)) return false;

    return location.pathname === '/view';
  },
  isShowingModal(location) {
    return this.isShowingIntroModal(location) || this.isShowingDocumentationModal(location);
  },
  isShowingDocumentationModal(location) {
    const parsedQuery = queryString.parse(location.search, { decode: true });
    return parsedQuery.modal === 'documentation';
  },
  isShowingIntroModal(location) {
    const parsedQuery = queryString.parse(location.search, { decode: true });
    const hideIntro = (location && location.state && location.state.hideIntro === true) || false; // eslint-disable-line max-len

    return parsedQuery.modal === 'intro' || !hideIntro;
  },
  currentLocationName(location) {
    return this.getLocationName(location);
  },

  /* ------------------------ */
  /* PREIVOUS LOCATION */
  /* ------------------------ */

  previousLocationName() {
    const lastLocation = locationHistory.lastLocation();
    return this.getLocationName(lastLocation);
  },

  /* ----------------------------*/
  /* Documentation page handling */
  /* ----------------------------*/
  documentationPages: [],
  // a page is an object in the form { pageDisplayName, pageRouterName, pagePath }
  //  the display name is used by the UI
  //  the router name is used to match routes and is what is shown in the querystring
  //  the path is the path to the documentation markdown file. It is used by the markdown component
  registerDocumentationPages(pages) {
    if (Array.isArray(pages)) {
      this.documentationPages = this.documentationPages.concat(pages);
    } else {
      this.documentationPage.push(pages);
    }
  },
  getSelectedDocumentationPage(location) {
    const parsedQuery = queryString.parse(location.search, { decode: true });
    const pageRouterName = parsedQuery.docPage;
    const page = this.documentationPages.find(p => p.pageRouterName === pageRouterName);
    if (!page) return this.documentationPages[0];
    return page;
  },
  getPreviousDocumentationPage(location) {
    const currentPage = this.getSelectedDocumentationPage(location);
    const currentIndex = this.documentationPages.findIndex(p => p.pageRouterName === currentPage.pageRouterName); // eslint-disable-line max-len

    if (currentIndex === 0 || currentIndex === undefined) return undefined;
    return this.documentationPages[currentIndex - 1];
  },
  getNextDocumentationPage(location) {
    const currentPage = this.getSelectedDocumentationPage(location);
    const currentIndex = this.documentationPages.findIndex(p => p.pageRouterName === currentPage.pageRouterName); // eslint-disable-line max-len

    if (currentIndex === (this.documentationPages.length - 1) || currentIndex === undefined) return undefined; // eslint-disable-line max-len
    return this.documentationPages[currentIndex + 1];
  },
};

export { router, locationHistory };
