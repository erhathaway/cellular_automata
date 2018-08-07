import React from 'react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container menuName="style" {...props}>
    <AttributeHeader>
      Random
    </AttributeHeader>
    <TitleHeader>
      Genesis
    </TitleHeader>
  </Container>
);
