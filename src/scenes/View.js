import React from 'react';
import styled from 'react-emotion';
import { ViewPlayer } from '../features';

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
  Shape as ShapePopup,
  States as StatesPopup,
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
      <PopupManager popupName="dimensions" component={DimensionsPopup}>
        <Dimensions />
      </PopupManager>

      <PopupManager popupName="viewer" component={ViewerPopup}>
        <Viewer />
      </PopupManager>

      <PopupManager popupName="states" component={StatesPopup}>
        <States />
      </PopupManager>

      <PopupManager popupName="viewer" component={ShapePopup}>
        <Shape />
      </PopupManager>

      <PopupManager popupName="viewer" component={DimensionsPopup}>
        <Neighbors />
      </PopupManager>

      <PopupManager popupName="viewer" component={DimensionsPopup}>
        <Rule ruleType="sbd" />
      </PopupManager>

      <PopupManager popupName="viewer" component={DimensionsPopup}>
        <Style />
      </PopupManager>
    </MenuContainer>

    <ViewPlayer {...props} />
  </Container>
);
