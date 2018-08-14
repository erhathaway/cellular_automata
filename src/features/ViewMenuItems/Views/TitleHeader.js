import React from 'react';
import styled, { css } from 'react-emotion';
import PropTypes from 'prop-types';

// dock top or bottom
const ContainerHorizontal = css`
  border-bottom: 1px solid rgba(72, 72, 72, 0.5);
  padding-bottom: 5px;
`;

// dock left or right
const ContainerVertical = css`
`;

// has not docked
const ContainerNotDocked = css`
`;

// dock right
const ContainerVerticalRight = css`
  text-align: right;
`;


const Container = styled('h2')`
  // color: #464646;
  color: white;
  font-size: 10px;
  margin: 0px;
  margin-top: 5px;
  margin-bottom: 5px;
  width: 100%;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 2.3px;
  user-select: none;

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ContainerVertical)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ContainerVerticalRight)}
`;

const Component = ({ children, menuPlacement }) => (
  <Container menuPlacement={menuPlacement}>
    { children }
  </Container>
);

Component.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  menuPlacement: PropTypes.string,
};

Component.defaultProps = {
  menuPlacement: undefined,
};

export default Component;
