import React from 'react';

import {
  MainContainer as Container,
  AttributeHeader,
  TitleHeader,
  HeaderContainer,
  MultilineAttributeHeader,
} from './Views';

// ruleType: 'stats' = wolfram style; 'sbd' = surive born death (conways game of life style)
export default ({ ruleType, ...props }) => {
  if (ruleType === 'stats') { return (
    <Container menuName="rule" {...props}>
      <AttributeHeader>
        90012
      </AttributeHeader>
      <TitleHeader>
        Rule
      </TitleHeader>
    </Container>
  );
  }

  if (ruleType === 'sbd') { return (
    <Container menuName="rule" {...props}>
      <HeaderContainer>
        <MultilineAttributeHeader prefix="S">
          2, 3, 5
        </MultilineAttributeHeader>
        <MultilineAttributeHeader prefix="B">
          4
        </MultilineAttributeHeader>
      </HeaderContainer>
      <TitleHeader>
        Rule (Conway)
      </TitleHeader>
    </Container>
  );
  }

  return null;
};
