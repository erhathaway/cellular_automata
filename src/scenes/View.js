import React from 'react';
import styled from 'react-emotion';
import { ViewMenu, ViewPlayer } from '../features';

const Container = styled('div')`
  position: relative;
  // background-color: chocolate;
  // background-color: #2e4d5d;
  background-color: olivedrab;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`;

const SubMenuModalPortal = styled('div')`
`;

export default props => (
  <Container>
    <ViewMenu {...props} />
    <ViewPlayer {...props} />
    <SubMenuModalPortal id="view-submenu-modal-root" />
  </Container>
);
