import React from 'react';
import styled from 'react-emotion';

const Container = styled('p')`
  color: gray;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 15px;
  color: #4e5220;
  line-height: 28px;
  letter-spacing: 5px;
  text-transform: uppercase;
  width: 100%;

  margin-bottom: 50px;

  @media (min-width: 900px) {
    margin-bottom: 80px;
    margin-top: 50px;
  }

  @media (max-width: 900px) {
    margin-bottom: 20px;
    margin-top: 30px;
  }

  @media (max-width: 460px) {
    margin-bottom: 100px;
    margin-top: 30px;
  }
`;

export default props => (
  <Container className="landing-description" {...props}>
    {'a social cellular automata & generative art experiment'}
  </Container>
);
