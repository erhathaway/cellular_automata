import React from 'react';
import styled from 'react-emotion';

import Container from './MenuContainer';
import { Dimensions, Neighbors, Rule, Shape, States, Style, Viewer } from './MenuItems';

const Item = styled('div')`
  height: 100%;
  width: 100%;
  margin: 1px;
  background-color: rgba(54, 149, 217, 1);
`;

export default (props) => (
  <Container {...props}>
    <Dimensions />
    <Viewer />
    <States />
    <Shape />
    <Neighbors />
    <Rule ruleType="sbd"/>
    <Style />
  </Container>
);
