import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';
import { Transition } from 'react-transition-group';

import { ViewPlayer, ViewControls, LibraryView } from '../features';

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

const VIEW_AREA_CONTAINER_ID = 'view-area-container';

const Container = styled('div')`
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hiddne;
  flex-direction: ${({ orientation }) => (orientation === 'landscape' ? 'row-reverse' : 'column-reverse')};
`;

const ViewerAreaContainer = styled('div')`
  position: relative;
  background-color: olivedrab;
  flex-grow: 1;
  z-index: 0;
`;

const Component = ({ automataMenuStore: menu, deviceStateStore: device, routerStore: router, ...props }) => {
  let shouldPositionPopup;
  if (menu.placement === 'left') { shouldPositionPopup = 'right'; }
  else if (menu.placement === 'right') { shouldPositionPopup = 'left'; }
  else if (menu.placement === 'top') { shouldPositionPopup = 'bottom'; }

  const isLibraryVisible = router.viewRouter.isFeatureVisible('library')

  return (
    <Container orientation={device.orientation}>
      <Transition
        in={isLibraryVisible}
        timeout={500}
        mountOnEnter
        onmountOnExit
      >
        { state => state !== 'exited' && <LibraryView transitionState={state} {...props} /> }
      </Transition>
      <ViewerAreaContainer id={VIEW_AREA_CONTAINER_ID}>
        <ViewPlayer {...props} />
        <PopupArea id="popup-area" style={{ height: '100%', width: '100%', backgrounColor: 'blue', position: 'relative' }} />

        <MenuContainer shouldPositionPopup={shouldPositionPopup} parentID={VIEW_AREA_CONTAINER_ID} {...props}>
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
      </ViewerAreaContainer>
    </Container>
  );
}

export default inject('automataMenuStore', 'deviceStateStore', 'routerStore')(observer(Component));
