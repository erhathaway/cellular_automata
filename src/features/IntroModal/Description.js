import React from 'react';
import styled from 'react-emotion';

const Container = styled('p')`
  color: gray;
  display: flex;
  justify-content: center;
  text-align: center;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};


  font-size: 15px;
  color: #4e5220;
  line-height: 28px;
  letter-spacing: 5px;
  text-transform: uppercase;
  width: 150%;
`;

export default props => (
  <Container className="landing-description" {...props}>
    {'a social cellular automata & generative art experiment'}
  </Container>
);
