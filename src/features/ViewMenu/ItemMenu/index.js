import React from 'react';
import styled from 'react-emotion';

import MenuContainer from './MenuContainer';

const Test = styled('div')`
  height: 100px;
  width: 300px;
  background-color: black;
  margin: 3px;
  border-radius: 1px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
`;

export default (props) => (
  <MenuContainer {...props}>
    <Test />
  </MenuContainer>
);
