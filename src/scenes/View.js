import React from 'react';
import styled from 'react-emotion';
import { ViewMenu, ViewPlayer } from '../features';

import MenuContainer from '../features/ViewMenuContainer';

import {
  Dimensions,
  Neighbors,
  Rule,
  Shape,
  States,
  Style,
  Viewer,
} from '../features/ViewMenuItems';

import {
  Dimensions as DimensionsPopup,
  Viewer as ViewerPopup,
} from '../features/ViewMenuPopups';

import { PopupArea, PopupManager } from '../libs/popup';

const Container = styled('div')`
  position: relative;
  background-color: chocolate;
  // background-color: #2e4d5d;
  // background-color: olivedrab;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`;


export default props => (
  <Container>
    <PopupArea id="popup-area" />

    <MenuContainer {...props}>
      <Dimensions />
      <PopupManager component={ViewerPopup}>
        <Viewer />
      </PopupManager>
      <States />
      <Shape />
      <Neighbors />
      <Rule ruleType="sbd" />
      <Style />
    </MenuContainer>

    <ViewPlayer {...props} />
  </Container>
);
