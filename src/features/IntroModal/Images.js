import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  position: relative;
  display: flex;
  width: 100%;
  opacity: 0;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};
`;

const Image = styled('div')`
  width: 150px;
  height: 150px;
  background-color: #131313;
  margin-left: ${({ marginLeft }) => marginLeft || 20}px;
`;

export default props => (
  <Container className="landing-images" {...props}>
    <Image />
    <Image marginLeft={20} />
    <Image marginLeft={20} />
    <Image marginLeft={20} />
  </Container>
);
