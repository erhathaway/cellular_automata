import React from 'react';

import MenuContainer from './MenuContainer';

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
  <MenuContainer {...props}>
    <Dimensions />
    <Viewer />
    <States />
    <Shape />
    <Neighbors />
    <Rule ruleType="sbd" />
    <Style />
  </MenuContainer>
);
