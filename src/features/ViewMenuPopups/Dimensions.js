import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';

import { Container, Title, Button } from './Views';

const ButtonContainer = styled('div')`
  display: flex;
  width: 80%;
  justify-content: center;
`;

export default inject('automataStore')(observer((props) => {
  const { automataStore: { dimension } } = props;
  return (
    <Container {...props} height="150px" width="270px">
      <Title>
        {'Cell Population Dimensions'}
      </Title>
      <ButtonContainer>
        <Button onClick={() => dimension.setDimension('1D')} isActive={dimension.value === '1D'}>
          1D
        </Button>
        <Button onClick={() => dimension.setDimension('2D')} isActive={dimension.value === '2D'}>
          2D
        </Button>
        <Button onClick={() => dimension.setDimension('3D')} isActive={dimension.value === '3D'}>
          3D
        </Button>
      </ButtonContainer>
    </Container>
  );
}));
