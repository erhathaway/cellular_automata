import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  height: 30px;
  width: 80px;
  text-align: center;
  padding: 10px;
  letter-spacing: 4px;
  font-size: 14px;
  border-radius: 2px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -1px;

  color: gray;
  border: 1px solid white;
  // background-color: gray;
  ${({ isActive }) => isActive && 'background-color: white;'}
  ${({ isActive }) => isActive && 'color: black;'}

  &:hover {
    color: white;
    background-color: black
  }
`;

export default ({ children, callback, isActive }) => (
  <Container onClick={callback} isActive={isActive}>
    { children }
  </Container>
);
