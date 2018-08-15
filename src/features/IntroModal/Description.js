import React from 'react';
import styled from 'react-emotion';

const Container = styled('p')`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15px;
  color: #7c842a;
  line-height: 28px;
  letter-spacing: 5px;
  text-transform: uppercase;
  width: 90vw;
  font-size: 20px;

  margin-bottom: 50px;
  margin-top: 50px;
  height: 50px;

  @media (max-width: 300px) {
    margin-bottom: 100px;
    margin-top: 70px;
  }
`;

export default props => (
  <Container className="landing-description" {...props}>
    {'a social cellular automata & generative art experiment'}
  </Container>
);
