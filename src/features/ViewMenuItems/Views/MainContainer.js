import React from 'react';
import styled, { css } from 'react-emotion';
import PropTypes from 'prop-types';

// dock top or bottom
const ContainerHorizontal = css`
  height: 100%;
  justify-content: center;
`;

// dock left or right
const ContainerVertical = css`
`;

// has not docked
const ContainerNotDocked = css`
  border-bottom: 1px solid #0e0e0e;
`;

// dock right
const ContainerVerticalRight = css`
  justify-content: flex-end;
  border-right: 1px solid rgba(0, 0, 0, 0);
  margin-right: 10px;
  padding-right: -10px;

  &:hover {
    border-right: 1px solid rgba(72, 72, 72, 0.5);
  }
`;

const Container = styled('div')`
  width: 100%;
  margin: 1px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;

  &:hover {
    ${({ isMenuMoving }) => !isMenuMoving && 'background-color: #4040403d;'}
  }

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ContainerVertical)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ContainerVerticalRight)}
`;

// dock top or bottom
const ChildrenHorizontal = css`
  height: 100%;
  flex-direction: column-reverse;
  justify-content: flex-end;
  padding-top: 50px;
  margin-left: 20px;
`;

// dock left or right
const ChildrenVertical = css`
`;

// has not docked
const ChildrenNotDocked = css`
`;

// dock right
const ChildrenVerticalRight = css`
  margin-left: 0px;
  margin-right: 30px;
`;

const Children = styled('div')`
  margin-left: 30px;
  display: flex;
  flex-direction: column;

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ChildrenNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ChildrenHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ChildrenVertical)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ChildrenVerticalRight)}
`;

const Component = ({ children, menuPlacement, isMenuMoving, ...props }) => { // eslint-disable-line object-curly-newline, max-len
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { menuPlacement, ...props }));

  return (
    <Container menuPlacement={menuPlacement} isMenuMoving={isMenuMoving}>
      <Children menuPlacement={menuPlacement}>
        { childrenWithProps }
      </Children>
    </Container>
  );
};

Component.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  menuPlacement: PropTypes.string,
  isMenuMoving: PropTypes.bool,
};

Component.defaultProps = {
  menuPlacement: undefined,
  isMenuMoving: false,
};

export default Component;
