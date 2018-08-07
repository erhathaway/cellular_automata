import React from 'react';

import {
  MainContainer as Container,
  MultilineAttributeHeader,
  TitleHeader,
  HeaderContainer,
} from './Views';

export default props => (
  <Container menuName="shape" {...props}>
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
