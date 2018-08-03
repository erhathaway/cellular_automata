import React from 'react';
import styled from 'react-emotion';

const Container = styled('nav')`
  // position: relative;
  width: 250px;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgba(56, 56, 56, 0.6);
  color: rgba(156, 156, 156, 1);
  letter-spacing: 8px;
`;

export default class Component extends React.Component {
  render() {
    return (
      <Container>
        hello
      </Container>
    )
  }
}
