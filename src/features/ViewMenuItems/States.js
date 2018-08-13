import React from 'react';
import { inject, observer } from 'mobx-react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default inject('automataStore')(observer((props) => {
  const { automataStore: { cellStates } } = props;

  return (
    <Container {...props}>
      <AttributeHeader>
        { cellStates.number() }
      </AttributeHeader>
      <TitleHeader>
        States
      </TitleHeader>
    </Container>
  );
}));
