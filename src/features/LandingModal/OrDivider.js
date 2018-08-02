import React from 'react';
import styled from 'react-emotion';
import anime from 'animejs';

const Container = styled('div')`
  position: relative;
  width: 100%;
  opacity: 0;
  background: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};

  @media (min-width: 420px) {
    width: 300px;
  }
`;

const Divider = styled('div')`
  border-bottom: 1px solid rgba(56, 56, 56, 0.4);
  width: 150px;
  height: 2px;
`;

const DividerText = styled('div')`
  font-family: 'Roboto', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(56, 56, 56, 1);
  margin: 10px;
`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.landing-or-divider',
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
      <Container className="landing-or-divider" {...this.props}>
        <Divider />
        <DividerText>
          or
        </DividerText>
        <Divider />
      </Container>
    );
  }
}
