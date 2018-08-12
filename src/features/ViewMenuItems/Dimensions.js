import React from 'react';
import { inject, observer } from 'mobx-react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default inject('store')(observer((props) => {
  const { store: { dimension } } = props;

  return (
    <Container {...props}>
      <AttributeHeader>
        { dimension.value }
      </AttributeHeader>
      <TitleHeader>
        Cells
      </TitleHeader>
    </Container>
  );
}));
