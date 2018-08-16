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
  border: 1px solid gray;
  // background-color: #80808063;

  background-color: #80808038;

  ${({ isActive }) => isActive && 'background-color: black;'}
  ${({ isActive }) => isActive && 'color: yellow;'}

  &:hover {
    color: yellow;
    background-color: black;
    cursor: pointer;
  }
`;

export default ({ children, callback, isActive, onClick }) => (
  <Container isActive={isActive} onClick={onClick}>
    { children }
  </Container>
);
