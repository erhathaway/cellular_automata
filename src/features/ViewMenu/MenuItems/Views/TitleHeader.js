import React from 'react';
import styled from 'react-emotion';

const Container = styled('h2')`
  color: #80CBEC;
  font-size: 10px;
  margin: 0px;
  margin-top: 2px;
  width: 100%;
  text-align: left;
  padding-left: 50px;
`;

export default ({ children }) => (
  <Container>
    { children }
  </Container>
);
