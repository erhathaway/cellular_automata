import React from 'react';
import styled from 'react-emotion';

import { Container, Title, DimensionLineItem } from './Views';

const DimensionContainer = styled('div')`
  display: flex;
  width: 80%;
  justify-content: center;
  margin-bottom: 10px;
`;

export default props => (
  <Container {...props} height="170px" width="300px">
    <Title>
      {'Population Size Per Dimension'}
    </Title>
    <DimensionContainer>
      <DimensionLineItem label="x" value="1000" />
    </DimensionContainer>
    <DimensionContainer>
      <DimensionLineItem label="y" value="10" />
    </DimensionContainer>
  </Container>
);
