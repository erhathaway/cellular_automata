import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

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

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-images',
      top: [-500, 0],
      left: [-300, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      scale: [0, 1],
      easing: 'easeOutQuint',
    });
  }

  componentDidMount() {
    Component.animateIn();
  }

  render() {
    return (
      <Container className="landing-images" {...this.props}>
        <Image />
        <Image marginLeft={20} />
        <Image marginLeft={20} />
        <Image marginLeft={20} />
      </Container>
    );
  }
}
