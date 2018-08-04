import queryString from 'query-string';

class LocationHistory {
  constructor() {
    this.history = [];
    this.maxHistoryLength = 100;
  }

  lastLocation() {
    this.history.splice(-this.maxHistoryLength);
    return this.history.slice(-1)[0];
  }

  addLocation(location) {
    this.history.push({ ...location });
  }
}

const locationHistory = new LocationHistory();

const router = {
  /* NAV */

  navToView(history) {
    history.push({ pathname: '/view', search: '?intro=true', state: { hideIntro: true } });
  },
  navToDocumentation(history) {
    history.push({ pathname: '/view', search: '?documentation=true', state: { hideIntro: true } });
  },
  navToDocumentationPage(history, pageRouterName) {
    const parsedQuery = queryString.parse(history.location.search, { decode: true });
    parsedQuery.docPage = pageRouterName;
    const location = { ...history.location };
    location.search = queryString.stringify(parsedQuery);
    history.push(location);
  },
  closeDocumentationModal(history) {
    const parsedQuery = queryString.parse(history.location.search, { decode: true });
    delete parsedQuery.docPage;
    delete parsedQuery.documentation;
    const location = { ...history.location };
    location.search = queryString.stringify(parsedQuery);
    history.push(location);
  },
  navToIntroModalFromDocumentationModal(history) {
    const parsedQuery = queryString.parse(history.location.search, { decode: true });
    delete parsedQuery.docPage;
    delete parsedQuery.documentation;
    parsedQuery.intro = true;
    const location = { ...history.location };
    location.search = queryString.stringify(parsedQuery);
    location.state.hideIntro = false;
    history.push(location);
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
    // console.log('from doc', lastLocation)
    if (lastLocation && this.shouldShowDocumentationModal(lastLocation)) { return true; }
    return false;
  },
  isComingFromIntroModal() {
    const lastLocation = locationHistory.lastLocation();
    if (lastLocation && this.shouldShowIntroModal(lastLocation)) { return true; }
    return false;
  },

  /* Documentation page handling */
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
