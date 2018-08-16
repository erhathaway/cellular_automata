import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';

import { ViewPlayer, ViewControls } from '../features';

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
  position: fixed;
  background-color: olivedrab;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`;

const Component = ({ automataMenuStore: menu, ...props }) => {
  let shouldPositionPopup;
  if (menu.placement === 'left') { shouldPositionPopup = 'right'; }
  else if (menu.placement === 'right') { shouldPositionPopup = 'left'; }
  else if (menu.placement === 'top') { shouldPositionPopup = 'bottom'; }

  // <div style={{ height: '100%', width: '100%', position: 'absolute'}}>
  return (
    <React.Fragment>
    <div style={{ height: '100px', width: '100vw', backgroundColor: 'orange', opacity: 0.9, zIndex: 999}} />
    <Container>
      <PopupArea id="popup-area" />
      <ViewPlayer {...props} />

      <MenuContainer shouldPositionPopup={shouldPositionPopup} {...props}>
        <PopupManager popupName="dimensions" component={DimensionsPopup}>
          <Dimensions />
        </PopupManager>

        <PopupManager popupName="viewer" component={ViewerPopup}>
          <Viewer />
        </PopupManager>

        <PopupManager popupName="states" component={StatesPopup}>
          <States />
        </PopupManager>

        <PopupManager popupName="shape" component={ShapePopup}>
          <Shape />
        </PopupManager>

        <Neighbors />
        <Rule />
        <Style />
      </MenuContainer>

      <ViewControls {...props} />
    </Container>
    </React.Fragment>
  );
}
// </div>

export default inject('automataMenuStore')(observer(Component));
