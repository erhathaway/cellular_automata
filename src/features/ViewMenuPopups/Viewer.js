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
  const { automataStore: { viewer, dimension } } = props;
  const availableViews = [
    [2],
    [2, 3],
    [3],
  ];
  return (
    <Container {...props} height="150px" width="270px">
      <Title>
        {'Dimensions To View Cells In'}
      </Title>
      <ButtonContainer>
        { availableViews[dimension.value - 1].map(viewDimension => (
          <Button key={`view-popup-button-${viewDimension}`} onClick={() => viewer.setValue(viewDimension)} isActive={viewDimension === viewer.value}>
            {`${viewDimension}D`}
          </Button>
        ))}
      </ButtonContainer>
    </Container>
  );
}));
