import React from 'react';
import styled, { css } from 'react-emotion';

// dock top or bottom
const ContainerHorizontal = css`
`;

// dock left or right
const ContainerVertical = css`

`;

// has not docked
const ContainerNotDocked = css`

`;

// dock right
const ContainerVerticalRight = css`
  text-align: right;
`;


const Container = styled('h2')`
  color: #80CBEC;
  font-size: 10px;
  margin: 0px;
  margin-top: 2px;
  margin-bottom: 5px;
  width: 100%;
  text-align: left;

  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ContainerVerticalRight)}
`;

export default ({ children, menuPlacement }) => (
  <Container menuPlacement={menuPlacement}>
    { children }
  </Container>
);
