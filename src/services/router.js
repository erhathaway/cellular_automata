import queryString from 'query-string';

const router = {
  navToView(history) {
    history.push({ pathname: '/view', search: '?intro=true', state: { hideIntro: true } });
  },
  navToDocumentation(history) {
    history.push({ pathname: '/view', search: '?documentation=true', state: { hideIntro: true } });
  },
  shouldShowDocumentationModal(history) {
    const parsedQuery = queryString.parse(history.location.search, { decode: true });
    const showDocumentation = parsedQuery.documentation === 'true';
    return showDocumentation;
  },
  shouldShowIntroModal(history) {
    const parsedQuery = queryString.parse(history.location.search, { decode: true });

    const hideIntro = (history.location && history.location.state && history.location.state.hideIntro === true) || false; // eslint-disable-line max-len
    const showIntro = !hideIntro && (parsedQuery.intro === 'true' || !parsedQuery.intro);

    return showIntro;
  },
  isRoutingToView(history) {

  },
  isRoutingToExplore(history) {

  },
};

export default router;
