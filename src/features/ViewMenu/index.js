import React from 'react';
import styled from 'react-emotion';

import Container from './Container';

const Item = styled('div')`
  height: 100%;
  width: 100%;
  margin: 1px;
  background-color: rgba(54, 149, 217, 1);
`;

export default (props) => (
  <Container {...props}>
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
  </Container>
);
