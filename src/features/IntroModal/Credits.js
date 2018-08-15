import React from 'react';
import styled from 'react-emotion';

import github from '../../assets/github.svg';

const Container = styled('div')`
  position: fixed;
  background: inherit;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 30px;
  width: 250px;
  right: 0px;

  &:hover {
    cursor: pointer;
  }

  > a {
    text-decoration: none;
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
  width: 100px;
  color: white;
`;

const Link = styled('a')`
  text-decoration: none;
`

export default () => (
  <Container>
    <Link href="https://www.linkedin.com/in/erhathaway/" target="_blank">
      <Name>
        Ethan Hathaway
      </Name>
    </Link>
    <Link href="https://github.com/erhathaway/cellular_automata/" target="_blank">
      <LinkIcon src={github} alt="github" />
    </Link>
  </Container>
);
