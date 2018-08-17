import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  Container,
  HomeButton,
  DocumentationButton,
  AutomataMenuButton,
} from '../features/MainNav';

const Component = ({ history }) => (
  <Container history={history}>
    <HomeButton />
    <DocumentationButton />
    <AutomataMenuButton />
  </Container>
);

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

Component.defaultProps = {

};

export default Component;
