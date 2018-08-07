import React from 'react';

import Container from './MenuContainer';

import {
  Dimensions,
  Neighbors,
  Rule,
  Shape,
  States,
  Style,
  Viewer,
} from './MenuItems';

export default props => (
  <Container {...props}>
    <Dimensions />
    <Viewer />
    <States />
    <Shape />
    <Neighbors />
    <Rule ruleType="sbd" />
    <Style />
  </Container>
);
