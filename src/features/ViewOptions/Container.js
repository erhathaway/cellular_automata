import React from 'react';
import styled from 'react-emotion';

const Container = styled('nav')`
  position: relative;
  left: 70px;
  top: 50px;
  width: 160px;
  height: 500px;
  background-color: #3696D9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  border-radius: 11px;
`;

export default () => <Container />;
