import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  height: 30px;
  color: gray;
  text-align: center;
  padding: 10px;
  letter-spacing: 3px;
  font-size: 12px;
`;

export default ({ children }) => (
  <Container>
    { children }
  </Container>
);
