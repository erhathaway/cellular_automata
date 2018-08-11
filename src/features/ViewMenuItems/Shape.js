import React from 'react';

import { Shape } from '../ViewMenuPopups';

import {
  MainContainer as Container,
  MultilineAttributeHeader,
  TitleHeader,
  HeaderContainer,
} from './Views';

export default props => (
  <Container popupName="shape" popupComponent={Shape} {...props}>
    <HeaderContainer>
      <MultilineAttributeHeader shouldTruncateNumber prefix="x">
        2265173
      </MultilineAttributeHeader>
      <MultilineAttributeHeader shouldTruncateNumber prefix="y">
        21
      </MultilineAttributeHeader>
      <MultilineAttributeHeader shouldTruncateNumber prefix="z">
        2000
      </MultilineAttributeHeader>
    </HeaderContainer>
    <TitleHeader>
      Population
    </TitleHeader>
  </Container>
);
