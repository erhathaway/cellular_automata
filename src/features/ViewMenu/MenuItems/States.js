import React from 'react';
import styled from 'react-emotion';

import { AttributeHeader, TitleHeader } from './Views';

const Container = styled('div')`
  height: 100%;
  width: 100%;
  margin: 1px;
  background-color: rgba(54, 149, 217, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default props => (
  <Container {...props}>
    <AttributeHeader>2</AttributeHeader>
    <TitleHeader>States</TitleHeader>
  </Container>
);
