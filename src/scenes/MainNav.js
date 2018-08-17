import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import { Container, HomeButton } from '../features/MainNav';

const Component = ({ history }) => (
  <Container history={history}>
    <HomeButton />
    <HomeButton />
    <HomeButton />
    <HomeButton />

  </Container>
);

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

Component.defaultProps = {

};

export default Component;
