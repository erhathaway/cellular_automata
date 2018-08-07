import React from 'react';
import styled, { css } from 'react-emotion';

// dock top or bottom
const ContainerHorizontal = css`
  height: 100%;
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
`;

const Container = styled('div')`
  width: 100%;
  margin: 1px;
  // background-color: rgba(54, 149, 217, 1);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;

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

export default ({ children, menuPlacement, ...props }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { menuPlacement, ...props }));

  return (
    <Container menuPlacement={menuPlacement}>
      <Children menuPlacement={menuPlacement}>
        { childrenWithProps }
      </Children>
    </Container>
  );
};
