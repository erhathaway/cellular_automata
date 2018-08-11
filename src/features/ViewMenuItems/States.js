import React from 'react';

import { Dimensions } from '../ViewMenuPopups';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default props => (
  <Container popupName="states" popupComponent={Dimensions} {...props}>
    <AttributeHeader>
      2
    </AttributeHeader>
    <TitleHeader>
      States
    </TitleHeader>
  </Container>
);
