import React from 'react';
import styled from 'react-emotion';
import { ViewMenu } from '../features';

const Container = styled('div')`
  position: relative;
  background-color: #655656;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`;

export default (props) => (
  <Container>
    <ViewMenu {...props}/>
  </Container>
);
