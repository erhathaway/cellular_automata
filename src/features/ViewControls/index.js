import React from 'react';
import styled from 'react-emotion';

import PlayButton from './PlayButton';
import MenuContainer from './MenuContainer';
import ProgressBar from './ProgressBar';
import ReverseButton from './ReverseButton';

const Container = styled('aside')`
  position: absolute;
  display: flex;
  justify-content: center;
  bottom: 20px;
  height: 95px;
  width: calc(100% - 100px);
  margin-left: 50px;
  margin-right: 50px;
`;

const ContstraintContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  height: 100%;
`

const Bottom = styled('div')`
  height: 100%;
  display: flex;
  margin: 15px;
  margin-bottom: 0px;
`;

export default props => (
  <Container>
    <ContstraintContainer>
      <ProgressBar />
      <Bottom>
        <PlayButton {...props} />
        <MenuContainer>
          <ReverseButton />
        </MenuContainer>
      </Bottom>
    </ContstraintContainer>
  </Container>
);
