import React from 'react';
import { inject, observer } from 'mobx-react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default inject('automataStore')(observer((props) => {
  const { automataStore: { dimension } } = props;

  return (
    <Container {...props}>
      <AttributeHeader>
        { `${dimension.value}D` }
      </AttributeHeader>
      <TitleHeader>
        Cells
      </TitleHeader>
    </Container>
  );
}));
