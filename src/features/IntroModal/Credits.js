import React from 'react';
import styled from 'react-emotion';

import github from '../../assets/github.svg';

const Container = styled('div')`
  position: relative;
  background: inherit;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 1;
  color: white;
  height: 30px;

  &:hover {
    cursor: pointer;
  }
`;

const LinkIcon = styled('img')`
  width: 30px;
  height: 30px;
`;

const Name = styled('div')`
  font-family: 'Roboto', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: right;
  margin-right: 30px;
  margin-bottom: 5px;
`;

export default () => (
  <Container>
    <Name>
      Ethan Hathaway
    </Name>
    <LinkIcon src={github} alt="github" />
  </Container>
);
