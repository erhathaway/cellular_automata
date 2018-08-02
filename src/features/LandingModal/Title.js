import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

const Container = styled('div')`
  position: relative;
  width: 100%;
  opacity: 0;
  color: white;
  display: flex;
  justify-content: flex-start;
  font-family: 'Bad Script', cursive;
  align-items: center;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};
  padding-left: 50px;
`;

const Title = styled('h1')`
  letter-spacing: 4px;
`;

const Subtitle = styled('h2')`
  padding-left: 10px;
  font-family: 'Bad Script', cursive;
  letter-spacing: 6px;

`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-title',
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
      <Container className="landing-title" {...this.props}>
        <Title>
          Cell
        </Title>
        <Subtitle>
        .af
        </Subtitle>
      </Container>
    );
  }
}
