import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  Container,
  HomeButton,
  DocumentationButton,
  AutomataMenuButton,
  MyAutomataButton,
} from '../features/MainNav';

const Component = ({ history }) => (
  <Container history={history}>
    <HomeButton />
    <DocumentationButton />
    <AutomataMenuButton />
    <MyAutomataButton />
  </Container>
);

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

Component.defaultProps = {

};

export default Component;
