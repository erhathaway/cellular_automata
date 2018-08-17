import React from 'react';
import styled from 'react-emotion';

const Container = styled('aside')`
  height: 18px;
  width: 100%;
  background-color: rgba(0,0,0,0.6);
  border-radius: 7px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid rgba(56,56,56,0.8);
`;

export default () => (
  <Container />
);
