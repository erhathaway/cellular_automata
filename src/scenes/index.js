import React, { Component } from 'react';
import styled from 'react-emotion';

import { LandingModal } from '../features';

const Container = styled('div')`
  display: flex;
`;

class App extends Component {
  render() {
    return (
      <Container>
        <p> Hello world </p>
        <LandingModal/>
      </Container>
    );
  }
}

export default App;
