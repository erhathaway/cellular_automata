import React from 'react';
import { inject, observer } from 'mobx-react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default inject('automataStore')(observer((props) => {
  const { automataStore: { neighbors } } = props;

  return (
    <Container {...props}>
      <AttributeHeader>
        { neighbors.value.length }
      </AttributeHeader>
      <TitleHeader>
        Neighbors
      </TitleHeader>
    </Container>
  );
}));
