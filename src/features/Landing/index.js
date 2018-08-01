import React from 'react';
import styled from 'react-emotion';

import Intro from './Intro';
import LearnMore from './LearnMore';
import Start from './Start';

const Container = styled('div')`
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Bottom = styled('div')`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const BottomPadding = styled('div')`
  width: 10px;
`;

export default () => (
  <Container>
    <Intro />
    <Bottom>
      <LearnMore />
      <BottomPadding />
      <Start />
    </Bottom>
  </Container>
);
