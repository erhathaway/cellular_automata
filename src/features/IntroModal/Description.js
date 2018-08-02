import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

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
`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-description',
      top: [300, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 500,
    });
  }

  componentDidMount() {
    Component.animateIn();
  }

  render() {
    return (
      <Container className="landing-description" {...this.props}>
        {'a social cellular automata & generative art experiment'}
      </Container>
    );
  }
}
