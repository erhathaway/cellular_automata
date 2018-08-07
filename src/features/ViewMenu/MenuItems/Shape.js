import React from 'react';
import styled from 'react-emotion';

import { MultilineAttributeHeader, TitleHeader, HeaderContainer } from './Views';

const Container = styled('div')`
  height: 170%;
  width: 100%;
  margin: 1px;
  background-color: rgba(54, 149, 217, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default props => (
  <Container {...props}>
    <HeaderContainer>
      <MultilineAttributeHeader shouldTruncateNumber prefix="x">21150</MultilineAttributeHeader>
      <MultilineAttributeHeader shouldTruncateNumber prefix="y">21</MultilineAttributeHeader>
      <MultilineAttributeHeader shouldTruncateNumber prefix="z">2000</MultilineAttributeHeader>
    </HeaderContainer>
    <TitleHeader>Population</TitleHeader>
  </Container>
);
