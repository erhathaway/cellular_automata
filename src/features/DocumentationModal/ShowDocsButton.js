import React from 'react';
import styled from 'react-emotion';

const Container = styled('button')`
  position: fixed;
  font-family: 'Roboto', sans-serif;
  font-weight: lighter;
  font-size: 20px;
  outline: none;
  background: none;
  border: 1px solid rgba(56, 56, 56, 0.4);
  border-radius: 50%;
  color: #ffffff36;
  background-color: #353535;
  z-index: 999;
  display: none;
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12), 0 5px 5px -3px rgba(0, 0, 0, .2);

  @media (max-width: 800px) {
    display: initial;
    right: 75px;
    bottom: 55px;
    width: 60px;
    height: 60px;
  }

  @media (max-width: 500px) {
    bottom: 40px;
    right: 60px;
    width: 50px;
    height: 50px;
  }

  &:hover {
    color: green;
    cursor: pointer;
  }
`;

export default ({ onClick }) => (
  <Container onClick={onClick}>
    <i className="fas fa-arrows-alt-v" />
  </Container>
)
