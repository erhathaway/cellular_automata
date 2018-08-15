import React from 'react';
import styled from 'react-emotion';

import OneDInTwoD from '../../assets/1dIn2d.jpg';

const Container = styled('div')`
  position: fixed;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100vw;
  opacity: 0;
  z-index: 0;
`;

const Image = styled('img')`
  width: 100vw;
  height: 100vh;
  opacity: 0.1;
  background-image: url(${({ backgroundImage }) => backgroundImage});

  @media (max-width: 900px) {
    background-size: cover;
  }
`;

export default props => (
  <Container className="landing-images" {...props}>
    <Image backgroundImage={OneDInTwoD}/>
  </Container>
);
