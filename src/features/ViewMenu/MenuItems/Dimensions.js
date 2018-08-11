import React from 'react';

import { Dimensions } from '../ItemMenu';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container popupName="dimension" popupComponent={Dimensions} {...props}>
    <AttributeHeader>
      1D
    </AttributeHeader>
    <TitleHeader>
      Cells
    </TitleHeader>
  </Container>
);
