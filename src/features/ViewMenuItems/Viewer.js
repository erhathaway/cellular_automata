import React from 'react';

import { Viewer } from '../ViewMenuPopups';

import { MainContainerWithoutPopup as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container {...props}>
    <AttributeHeader>
      2D
    </AttributeHeader>
    <TitleHeader>
      Viewer
    </TitleHeader>
  </Container>
);
