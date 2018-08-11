import React from 'react';

import { Dimensions } from '../ItemMenu';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container popupName="style" popupComponent={Dimensions} {...props}>
    <AttributeHeader>
      Random
    </AttributeHeader>
    <TitleHeader>
      Genesis
    </TitleHeader>
  </Container>
);
