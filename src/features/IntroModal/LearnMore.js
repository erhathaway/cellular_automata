import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

const Container = styled('div')`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: inherit;
  border: none;
  outline: none;
  font-family: 'Roboto', sans-serif;
  color: rgb(105,105,105);
  font-size: 14px;
  letter-spacing: 3.5px;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};
  padding: 20px;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }
`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-learn-more',
      bottom: [-300, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 600,
    });
  }

  componentDidMount() {
    Component.animateIn();
  }

  render() {
    return (
      <Container className="landing-learn-more" {...this.props}>
        Learn about cellular automata
      </Container>
    );
  }
}
