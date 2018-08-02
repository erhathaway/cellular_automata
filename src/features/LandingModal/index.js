import React from 'react';
import styled from 'react-emotion';

import Title from './Title';
import Images from './Images';
import Description from './Description';
import Start from './Start';
import OrDivider from './OrDivider';
import LearnMore from './LearnMore';
import Credits from './Credits';

const Container = styled('div')`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Middle = styled('div')`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 700px;

  @media (max-width: 900px) {
    width: 80%;
    min-width: 300px;
    max-width: 700px;
  }

  @media (max-width: 320px) {
    width: 300px;
  }
`;

const Bottom = styled('div')`
  position: relative;
  bottom: 0px;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  height: 65px;
`;

export default () => (
  <Container>
    <Middle>
      <Title marginTop="0px" marginBottom="10px" />
      <Images marginBottom={100} />
      <Description marginTop="45px" marginBottom="120px" />
      <Start marginTop="0px" marginBottom="0px" />
      <OrDivider marginTop="15px" marginBottom="15px" />
      <LearnMore marginTop="0px" marginBottom="0px" />
    </Middle>
    <Bottom>
      <Credits />
    </Bottom>
  </Container>
);
