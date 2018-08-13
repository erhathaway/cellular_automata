import React from 'react';
import styled from 'react-emotion';

const Container = styled('aside')`
  position: absolute;
  top: 0px;
  right: 0px;
  height: 14px;
  width: 100%;
  background-color: #4040403d;
  border-radius: 7px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export default () => (
  <Container />
);
