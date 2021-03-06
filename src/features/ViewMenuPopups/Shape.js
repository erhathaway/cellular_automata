import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';

import { Container, Title, DimensionLineItem } from './Views';

const DimensionContainer = styled('div')`
  display: flex;
  width: 80%;
  justify-content: center;
  margin-bottom: 10px;
`;

export default inject('automataStore')(observer((props) => {
  const { automataStore: { populationShape } } = props;

  const numberOfDimensions = populationShape.keys.length;

  return (
    <Container {...props} height={`${110 + numberOfDimensions * 40}px`} width="300px">
      <Title>
        {'Population Size Per Dimension'}
      </Title>
      { populationShape.keys.map(name => (
        <DimensionContainer key={`poup-population-shape-container-${name}`}>
          <DimensionLineItem dimensionName={name} />
        </DimensionContainer>
      ))}
    </Container>
  );
}));
