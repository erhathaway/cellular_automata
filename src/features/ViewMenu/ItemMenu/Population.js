import React from 'react';
import styled from 'react-emotion';

import { Container, Title, DimensionLineItem } from './Views';

const DimensionContainer = styled('div')`
  display: flex;
  width: 80%;
  justify-content: center;
`;

export default props => (
  <Container {...props} height="150px" width="270px">
    <Title>
      {'Population Size Per Dimension'}
    </Title>
    <DimensionContainer>
      <DimensionLineItem label="x">
    </DimensionContainer>
  </Container>
);
