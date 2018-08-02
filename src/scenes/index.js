import React from 'react';
import queryString from 'query-string';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { IntroModal, DocumentationModal } from '../features';
import ViewScene from './View';
import ExploreScene from './Explore';

const QueryStringHandler = ({ location }) => {
  const parsedQuery = queryString.parse(location.search, { decode: true })

  const showDocumentation = parsedQuery.documentation === 'true';
  const showIntro = parsedQuery.intro === 'true' || true;

  return (
    <div>
      <Switch>
        { showDocumentation && <Route path="*" component={DocumentationModal} /> }
        { showIntro && <Route path="*" component={IntroModal} /> }
      </Switch>
      <Switch>
        <Route path="/explore" component={ExploreScene} />
        <Route path="*" component={ViewScene} />
      </Switch>
    </div>
  );
};


export default () => {
  return (
    <BrowserRouter>
      <Route path="*" component={QueryStringHandler} />
    </BrowserRouter>
  );
};
