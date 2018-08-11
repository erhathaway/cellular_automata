import React from 'react';

import { Dimensions } from '../ItemMenu';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container popupName="neighbors" popupComponent={Dimensions} {...props}>
    <AttributeHeader>
      8
    </AttributeHeader>
    <TitleHeader>
      Neighbors
    </TitleHeader>
  </Container>
);
