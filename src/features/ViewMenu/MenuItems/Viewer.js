import React from 'react';

import { Viewer } from '../ItemMenu';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container popupName="viewer" popupComponent={Viewer} {...props}>
    <AttributeHeader>
      2D
    </AttributeHeader>
    <TitleHeader>
      Viewer
    </TitleHeader>
  </Container>
);
