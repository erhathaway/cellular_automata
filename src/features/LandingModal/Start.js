import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

const Container = styled('button')`
  position: relative;
  width: 200px;
  height: 70px;
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  letter-spacing: 2px;
  outline: none;
  padding: 0px;
  opacity: 0;
  border: 1px solid rgb(56,56,56);
  background: inherit;
  color: gray;
  text-transform: uppercase;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};
  border-radius: 1px;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }

  @media (min-width: 420px) {
    width: 300px;
  }
`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-start-button',
      top: [300, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 400,
    });
  }

  componentDidMount() {
    Component.animateIn();
  }


  render() {
    return (
      <Container className="landing-start-button" {...this.props}>
        Start
      </Container>
    );
  }
}
