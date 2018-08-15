import React from 'react';
import styled from 'react-emotion';

import OneDInTwoD from '../../assets/1dIn2d.jpg';
import TwoDInTwoD from '../../assets/2dIn2d.jpg';
import TwoDInThreeD from '../../assets/2dIn3d.jpg';
import ThreeDInThreeD from '../../assets/3dIn3d.jpg';

const Container = styled('div')`
  position: relative;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  opacity: 0;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};

  @media (max-width: 800px) {
    width: 400px;
  }

  @media (max-width: 500px) {
    width: 250px;
  }
`;

const Image = styled('img')`
  width: 150px;
  height: 150px;
  background-color: #131313;
  margin: 5px;

  @media (max-width: 900px) {
    width: 40%;
    height: 40%;
    max-width: 150px;
  }

  @media (max-width: 460px) {
    width: 50px;
    height: 50px;
  }
`;

export default props => (
  <Container className="landing-images" {...props}>
    <Image src={OneDInTwoD}/>
    <Image src={TwoDInTwoD} />
    <Image src={TwoDInThreeD} />
    <Image src={ThreeDInThreeD} />
  </Container>
);
