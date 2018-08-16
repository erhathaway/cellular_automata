import React from 'react';
import styled, { css } from 'react-emotion';
import { inject, observer } from 'mobx-react';

const MENU_BORDER_RADIUS = '6px';

// dock top or bottom
const NotDocked = css`
  border-radius: ${MENU_BORDER_RADIUS};
  border: 1px solid rgba(56,56,56,0.6);
  background-color: black;
`;

const Container = styled('div')`
  background-image: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.8), rgba(0,0,0,0.77), rgba(0,0,0,0.77), rgba(0,0,0,0.72));
  margin: 3px;
  border-radius: 2px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${({ isMenuDocked }) => !isMenuDocked && NotDocked}

`;

const Component = ({ show, children, height, width, automataMenuStore: menu, ...props }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, props));

  return (
    <Container style={{ height, width }} isMenuDocked={menu.isDocked}>
      { childrenWithProps }
    </Container>
  );
};

export default inject('automataMenuStore')(observer(Component));
