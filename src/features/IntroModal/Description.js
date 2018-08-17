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
  width: 90%;
  font-size: 20px;
  margin-bottom: 50px;
  margin-top: 100px;
  height: 50px;


  // @media (max-width: 550px) {
  //   max-width: 80%;
  //   text-align: right;
  //   padding-right: 50px;
  // }

  @media (max-width: 300px) {
    margin-bottom: 100px;
  }
`;

export default props => (
  <Container className="landing-description" {...props}>
    {'a social cellular automata & generative art experiment'}
  </Container>
);
