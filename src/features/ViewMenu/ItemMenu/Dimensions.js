import React from 'react';
import styled from 'react-emotion';

import { Container, Title, Button } from './Views';

const ButtonContainer = styled('div')`
  display: flex;
  width: 80%;
  justify-content: center;
`;

export default props => (
  <Container {...props} height="150px" width="270px">
    <Title>
      {'Cell Population Dimensions'}
    </Title>
    <ButtonContainer>
      <Button isActive>
        1D
      </Button>
      <Button>
        2D
      </Button>
    </ButtonContainer>
  </Container>
);
