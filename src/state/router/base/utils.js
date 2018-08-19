const queryString = require('../../../libs/query-string');



const extractScene = (location, routeKey) => {
  const path = location.pathname;
  const splitPath = path.split('/');
  // console.log('split path', path, splitPath)
  if (routeKey === '' || !routeKey) {
    return splitPath[1]
  }

  const index = splitPath.findIndex(p => p === routeKey);
  if (index) {
    const thisPath = splitPath[index + 1];
    return thisPath;
  }
  return undefined
};

const extractModal = (location, routeKey) => {
  const parsedQuery = queryString.parse(location.search, { decode: true });
  return parsedQuery[`${routeKey}modal`];
};

const extractFeatures = (location, routeKey) => {
  const parsedQuery = queryString.parse(location.search, { decode: true });
  return parsedQuery[`${routeKey}show`];
};
/* ------------------------ */
/* Query String Manipulation */
/* ------------------------ */
const removeFromQueryString = (existingQueryString, keysToRemove) => {
  const parsedQuery = queryString.parse(existingQueryString, { decode: true });
  keysToRemove.forEach(k => {
    delete parsedQuery[k];
  });
  return queryString.stringify(parsedQuery);
}

const addToQueryString = (existingQueryString, objs) => {
  const parsedQuery = queryString.parse(existingQueryString, { decode: true });
  const newQuery = { ...parsedQuery, ...objs };
  return queryString.stringify(newQuery);
}

/* ------------------------ */
/* METHODS GENERATION */
/* ------------------------ */
const dynamicallyGenerateNavToPathMethods = (self) => {
  if (!self.scenes) return {};

  return self.scenes.reduce((acc, { name }) => {
    // remove forward slashes
    const withoutSlash = name.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash !== '' ? (withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1)) : 'Home';

    // generate method
    const fnObj = { [`navTo${formattedName}`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, [`${self.routeKey}modal`, `${self.routeKey}show`]); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: name, search: cleanSearch, state: history.location.state });
    },
    };
    return { ...fnObj, ...acc };
  }, {});
};

const dynamicallyGenerateToggleModalMethods = (self) => {
  if (!self.modals) return {};

  return self.modals.reduce((acc, { name }) => {

    // remove forward slashes
    const withoutSlash = name.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1);

    // generate methods
    const openFnObj = { [`open${formattedName}Modal`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, [`${self.routeKey}modal`]); // modals are shown via the 'modal' field in the query string
      const newSearch = addToQueryString(cleanSearch, { [`${self.routeKey}modal`]: name }); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
    },
    };


    // NOTE at the moment this will just close all modals since only one can exist at a time
    const closeFnObj = { [`close${formattedName}Modal`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, [`${self.routeKey}modal`]); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: history.location.pathname, search: cleanSearch, state: history.location.state });
    },
    };
    return { ...openFnObj, ...closeFnObj, ...acc };
  }, {});
};

const dynamicallyGenerateToggleVisibleFeaturesMethods = (self) => {
  if (!self.features) return {};

  return self.features.reduce((acc, { name }) => {

    // uppercase first letter
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    // generate methods
    const addfnObj = { [`show${formattedName}Feature`](history) {
      // console.log('hiiii', history)
      const newSearch = addToQueryString(history.location.search, { [`${self.routeKey}show`]: formattedName }); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
      },
    };

    // NOTE at the moment this will just close all features since only one can exist at a time
    const removeFnObj = { [`hide${formattedName}Feature`](history) {
      const newSearch = removeFromQueryString(history.location.search, [`${self.routeKey}show`]); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
      },
    };


    return { ...addfnObj, ...removeFnObj, ...acc };
  }, {});
};

export {
  dynamicallyGenerateNavToPathMethods,
  dynamicallyGenerateToggleModalMethods,
  dynamicallyGenerateToggleVisibleFeaturesMethods,
  extractScene,
  extractFeatures,
  extractModal,
};
