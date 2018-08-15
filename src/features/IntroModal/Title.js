import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  position: relative;
  width: 100%;
  color: white;
  display: flex;
  justify-content: flex-start;
  font-family: 'Bad Script', cursive;
  align-items: center;
  padding-left: 50px;
`;
// margin-top: ${({ marginTop }) => marginTop || '0px'};
// margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};

const Title = styled('h1')`
  font-size: 2em;
  letter-spacing: 4px;
`;

const Subtitle = styled('h2')`
  padding-left: 10px;
  font-family: 'Bad Script', cursive;
  font-size: 1em;
  letter-spacing: 6px;
`;

export default props => (
  <Container className="landing-title" {...props}>
    <Title>
      Cell
    </Title>
    <Subtitle>
    .af
    </Subtitle>
  </Container>
);
