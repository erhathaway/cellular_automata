import React from 'react';
import styled, { css } from 'react-emotion';

const MENU_BORDER_RADIUS = '8px';

/* ----------------------------------------------------------------------------*/
/* Menu Control Container
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const ContainerHorizontal = css`
  left: 0px;
  height: 100%;
  flex-direction: row;
  width: 50px;
`;

// dock left or right
const ContainerVertical = css`
  left: 0px;
  width: 100%;
  height: 30px;
  flex-direction: column;
  border-radius: 0px;
`;

// not docked
const ContainerNotDocked = css`
  left: 0px;
  width: 100%;
  height: 25px;
`;

const Container = styled('div')`
  position: relative;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ContainerVertical)}
`;

/* ----------------------------------------------------------------------------*/
/* Menu Control Features
/* ----------------------------------------------------------------------------*/

// dock top or bottom
const DraggableContainerHorizontal = css`
  width: 50%;
  height: 100%;
  flex-direction: column;
`;

// dock left or right
const DraggableContainerVertical = css`
  width: 100%;
  height: 50%;
`;

// not docked
const DraggableContainerNotDocked = css`
  width: 100%;
  height: 100%;
  border-top-left-radius: ${MENU_BORDER_RADIUS};
  border-top-right-radius: ${MENU_BORDER_RADIUS};
`;

const DraggableContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 2;
  background-color: rgba(54, 149, 217, 0.7);

  &:hover {
    cursor: grab;
  }

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && DraggableContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && DraggableContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && DraggableContainerVertical)}
`;

const DraggableIcon = styled('div')`
  background-color: gray;
  border-radius: 50%;
  height: 6px;
  width: 6px;
  margin: 5px;
  margin-left: 3px;
  margin-right: 3px;
`;

// dock top or bottom
const ShrinkContainerHorizontal = css`
  width: 50%;
  height: 100%;
`;

// dock left or right
const ShrinkContainerVertical = css`
  width: 100%;
  height: 50%;
`;

// not docked
const ShrinkContainerNotDocked = css`
  width: 70px;
  height: 100%;
  border-top-right-radius: ${MENU_BORDER_RADIUS};
`;

const ShrinkContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(54, 149, 217, 1);

  &:hover {
    cursor: pointer;
  }

  ${({ menuPlacement }) => ((!menuPlacement || !menuPlacement.includes('hasDocked')) && ShrinkContainerNotDocked)}
  ${({ menuPlacement }) => (menuPlacement && menuPlacement.includes('hasDockedTop') && ShrinkContainerHorizontal)}
  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedLeft') || menuPlacement.includes('hasDockedRight')) && ShrinkContainerVertical)}
`;

const MenuShrinkButton = styled('div')`
  width: 20px;
  background-color: gray;
  height: 4px;
  border-radius: 2px;
`;

export default ({ menuPlacement }) => (
  <Container menuPlacement={menuPlacement}>
    <DraggableContainer menuPlacement={menuPlacement} className="view-menu-draggable-handle">
      <DraggableIcon />
      <DraggableIcon />
      <DraggableIcon />
    </DraggableContainer>
  </Container>
);

// <ShrinkContainer
// menuPlacement={menuPlacement}
// onClick={this.handleMenuOpenToggleClick}
// >
// <MenuShrinkButton />
// </ShrinkContainer>
