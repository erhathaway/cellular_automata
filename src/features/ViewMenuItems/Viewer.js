import React from 'react';
import { inject, observer } from 'mobx-react';

import { MainContainer as Container, AttributeHeader, TitleHeader } from './Views';

export default inject('automataStore')(observer((props) => {
  const { automataStore: { viewer } } = props;

  return (
    <Container {...props}>
      <AttributeHeader>
        {`${viewer.value}D`}
      </AttributeHeader>
      <TitleHeader>
        Viewer
      </TitleHeader>
    </Container>
  );
}));
