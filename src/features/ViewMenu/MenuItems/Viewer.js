import React from 'react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

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
