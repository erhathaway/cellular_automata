import React from 'react';
import { inject, observer } from 'mobx-react';

import {
  MainContainer as Container,
  MultilineAttributeHeader,
  TitleHeader,
  HeaderContainer,
} from './Views';

export default inject('automataStore')(observer((props) => {
  const { automataStore: { populationShape } } = props;

  return (
    <Container {...props}>
      <HeaderContainer>
        { populationShape.value.map(({ name, value }, i) => (
          <MultilineAttributeHeader key={`multiline-attibute-header-${name}-pop-shape-${i}`} shouldTruncateNumber prefix={name}>
            { value.toString() }
          </MultilineAttributeHeader>
        ))}
      </HeaderContainer>
      <TitleHeader>
        Population
      </TitleHeader>
    </Container>
  )}
));
