import React from 'react';
import styled from 'react-emotion';

const Container = styled('aside')`
  height: 60px;
  flex-grow: 1;
  margin-left: 10px;
  background-image: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.8), rgba(0,0,0,0.77), rgba(0,0,0,0.77), rgba(0,0,0,0.72));
  border-radius: 4px;
  border: 1px solid rgba(56,56,56,0.8);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
`;

export default ({ children }) => (
  <Container>
    { children }
  </Container>
);
