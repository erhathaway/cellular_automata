import React from 'react';
import styled, { css } from 'react-emotion';
import PropTypes from 'prop-types';

const MENU_BORDER_RADIUS = '8px';

/* ----------------------------------------------------------------------------*/
/* Menu Router Container
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const RouterContainerHorizontal = css`
  height: 100%;
  flex-direction: row;
  width: 150px;
  border-radius: 0px;
  right: 0px;
`;

// dock left or right
const RouterContainerVertical = css`
  width: 100%;
  flex-direction: column;
  height: 100px;
  left: 0px;
`;

// has not docked
const RouterContainerNotDocked = css`
  width: 100%;
  flex-direction: row;
`;

const RouterContainer = styled('nav')`
  position: relative;
  bottom: 0px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-bottom-left-radius: ${MENU_BORDER_RADIUS};
  border-bottom-right-radius: ${MENU_BORDER_RADIUS};

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && RouterContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && RouterContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && RouterContainerVertical)}
`;

/* ----------------------------------------------------------------------------*/
/* Menu Router Features
/* ----------------------------------------------------------------------------*/
// dock top or bottom
const FAIconHorizontal = css`
  height: 100%;

  &:hover {
    border-radius: 0px;
  }
`;

// dock left or right
const FAIconVertical = css`
  height: 50%;
  width: 100%;

  &:hover {
    border-radius: 0px;
  }
`;

// not docked
const FAIconNotDocked = css`
  padding: 10px;
`;

const FAIcon = styled('div')`
  color: gray;
  font-size: 20px;
  font-weight: light;
  width: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgba(54, 149, 217, 1);
    background-color: gray;
    ${({ leftOrRight }) => `border-bottom-${leftOrRight}-radius: ${MENU_BORDER_RADIUS};`}
  };

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && FAIconNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && FAIconHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && FAIconVertical)}
`;

const Component = ({ menuPlacement }) => (
  <RouterContainer menuPlacement={menuPlacement}>
    <FAIcon menuPlacement={menuPlacement} leftOrRight="left" className="fas fa-home" />
    <FAIcon menuPlacement={menuPlacement} leftOrRight="right" className="fas fa-question" />
  </RouterContainer>
);

Component.propTypes = {
  menuPlacement: PropTypes.string,
};

Component.defaultProps = {
  menuPlacement: undefined,
};

export default Component;
