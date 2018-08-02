import React from 'react';
import styled, { css } from 'react-emotion';
import anime from 'animejs';

import github from '../../assets/github.svg';

const Container = css`
  position: relative;
  background: inherit;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 0;
  color: white;
  height: 30px;

  @media (min-width: 420px) {
    width: 300px;
  }
`;

const LinkIcon = styled('img')`
  width: 30px;
  height: 30px;
`;

const Name = styled('div')`
  font-family: 'Roboto', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: right;
  margin-right: 30px;
  margin-bottom: 5px;
`;

export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: `.${Container}`,
      right: [-300, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 1500,
    });
  }

  componentDidMount() {
    Component.animateIn();
  }

  render() {
    return (
      <div className={Container}>
        <Name>
          Ethan Hathaway
        </Name>
        <LinkIcon src={github} alt="github" />
      </div>
    );
  }
}
