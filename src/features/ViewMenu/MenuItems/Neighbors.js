import React from 'react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container menuName="neighbors" {...props}>
    <AttributeHeader>
      8
    </AttributeHeader>
    <TitleHeader>
      Neighbors
    </TitleHeader>
  </Container>
);
