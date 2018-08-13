import React from 'react';
import styled from 'react-emotion';

import PlayButton from './PlayButton';
import MenuContainer from './MenuContainer';
import ProgressBar from './ProgressBar';
import ReverseButton from './ReverseButton';

const Container = styled('aside')`
  position: fixed;
  bottom: 20px;
  left: 250px;
  height: 95px;
  width: calc(100% - 500px);
  min-width: 400px;
`;

export default props => (
  <Container>
    <ProgressBar />
    <PlayButton {...props} />
    <MenuContainer>
      <ReverseButton />
    </MenuContainer>
  </Container>
);
