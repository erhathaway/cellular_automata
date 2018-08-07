import React from 'react';
import styled from 'react-emotion';

import {
  MainContainer as Container,
  AttributeHeader,
  TitleHeader,
  HeaderContainer,
  MultilineAttributeHeader,
} from './Views';

// height: 150%;
// width: 100%;
// margin: 1px;
// background-color: rgba(54, 149, 217, 1);
// display: flex;
// flex-direction: column;
// justify-content: flex-end;
// padding-bottom: 17px;
// align-items: center;
// const Container = styled('div')`
//   padding-top: 20px;
//   padding-bottom: 20px;
//   width: 100%;
//   margin: 1px;
//   background-color: rgba(54, 149, 217, 1);
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
// `;

// ruleType: 'stats' = wolfram style; 'sbd' = surive born death (conways game of life style)
export default ({ props, ruleType }) => {
  if (ruleType === 'stats') { return (
    <Container {...props}>
      <AttributeHeader>
        90012
      </AttributeHeader>
      <TitleHeader>
        Rule
      </TitleHeader>
    </Container>
  )}

  if (ruleType === 'sbd') { return (
    <Container {...props}>
      <HeaderContainer>
        <MultilineAttributeHeader prefix="S">
          2, 3, 5
        </MultilineAttributeHeader>
        <MultilineAttributeHeader prefix="B">
          4
        </MultilineAttributeHeader>
      </HeaderContainer>
      <TitleHeader>
        Rule
      </TitleHeader>
    </Container>
  ); }

  return null
};
