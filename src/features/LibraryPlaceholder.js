import React from 'react';
import styled, { css } from 'react-emotion';
import { inject, observer } from 'mobx-react';

const PortraitContainer = css`
  height: 180px;
  width: 100%;
  flex-direction: row;
`;

const LandscapeContainer = css`
  height: 100%;
  width: 180px;
  flex-direction: column;
`;

const Container = styled('aside')`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: yellow;
  ${({ orientation }) => (orientation === 'landscape' ? LandscapeContainer : PortraitContainer)}
`;

const Padding = styled('div')`
  background-color: blue;
  height: calc(100% - 40px);
  width: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  flex-direction: ${({ orientation }) => (orientation === 'landscape' ? 'column-reverse' : 'row')};
`;

const Component = ({ children, history, deviceStateStore: device, sceneModalsAndMenusStore: menus }) => {
  if (!menus.showViewMyAutomataMenu) return null;
  
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { history }));

  return (
    <Container orientation={device.orientation}>
      <Padding orientation={device.orientation}>
        { childrenWithProps }
      </Padding>
    </Container>
  );
};


export default inject('deviceStateStore', 'sceneModalsAndMenusStore')(observer(Component));
