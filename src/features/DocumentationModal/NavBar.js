import React from 'react';
import styled from 'react-emotion';

const Container = styled('nav')`
  width: 100%;
  height: 80px;
  background-color: #0d0d0d;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;

  @media (max-width: 500px) {
    height: 50px;
  }

  @media (min-width: 800px) {
    display: none;
  }
`;

export default ({ children }) => {
  return (
    <Container>
      { children }
    </Container>
  );
};
