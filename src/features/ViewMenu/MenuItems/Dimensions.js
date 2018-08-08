import React from 'react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container menuName="dimension" {...props}>
    <AttributeHeader>
      1D
    </AttributeHeader>
    <TitleHeader>
      Cells
    </TitleHeader>
  </Container>
);
