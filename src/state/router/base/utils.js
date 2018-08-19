const queryString = require('../../../libs/query-string');

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
const dynamicallyGenerateNavToPathMethods = (self, config) => {
  return config.paths.reduce((acc, name) => {
    // remove forward slashes
    const withoutSlash = name.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash !== '' ? (withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1)) : 'Home';
    // generate path name
    const pathName = name === '/' ? config.homePath : name;

    // generate method
    const fnObj = { [`navTo${formattedName}`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, ['modal', 'show']); // modals are shown via the 'modal' field in the query string
      history.push({ pathname: pathName, search: cleanSearch, state: history.location.state });
    },
    };
    return { ...fnObj, ...acc };
  }, {});
};

const dynamicallyGenerateToggleModalMethods = (self, config) => {
  return config.modals.reduce((acc, modalName) => {

    // remove forward slashes
    const withoutSlash = modalName.replace(/\//g, '')
    // uppercase first letter
    const formattedName = withoutSlash.charAt(0).toUpperCase() + withoutSlash.slice(1);

    // generate methods
    const openFnObj = { [`open${formattedName}Modal`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, ['modal']); // modals are shown via the 'modal' field in the query string
      const newSearch = addToQueryString(cleanSearch, { modal: modalName }); // modals are shown via the 'modal' field in the query string

      history.push({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
    },
    };


    // NOTE at the moment this will just close all modals since only one can exist at a time
    const closeFnObj = { [`close{formattedName}Modal`](history) {
      const cleanSearch = removeFromQueryString(history.location.search, ['modal']); // modals are shown via the 'modal' field in the query string

      history.push({ pathname: history.location.pathname, search: cleanSearch, state: history.location.state });
    },
    };
    return { ...openFnObj, ...closeFnObj, ...acc };
  }, {});
};

const dynamicallyGenerateToggleVisibleFeaturesMethods = (self, config) => {
  return config.visibleFeatures.reduce((acc, featureName) => {

    // uppercase first letter
    const formattedName = featureName.charAt(0).toUpperCase() + featureName.slice(1);

    // generate methods
    const addfnObj = { [`show${formattedName}Feature`](history) {
      const newSearch = addToQueryString(history.location.search, { show: formattedName }); // modals are shown via the 'modal' field in the query string
      history.replace({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
      },
    };

    const removeFnObj = { [`hide${formattedName}Feature`](history) {
      const newSearch = removeFromQueryString(history.location.search, ['show']); // modals are shown via the 'modal' field in the query string
      history.replace({ pathname: history.location.pathname, search: newSearch, state: history.location.state });
      },
    };


    return { ...addfnObj, ...removeFnObj, ...acc };
  }, {});
};

export {
  dynamicallyGenerateNavToPathMethods,
  dynamicallyGenerateToggleModalMethods,
  dynamicallyGenerateToggleVisibleFeaturesMethods,
};
