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
        <Button onClick={() => dimension.setValue(1)} isActive={dimension.value === 1}>
          1D
        </Button>
        <Button onClick={() => dimension.setValue(2)} isActive={dimension.value === 2}>
          2D
        </Button>
        <Button onClick={() => dimension.setValue(3)} isActive={dimension.value === 3}>
          3D
        </Button>
      </ButtonContainer>
    </Container>
  );
}));
