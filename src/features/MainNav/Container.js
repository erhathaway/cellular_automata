import React from 'react';
import styled, { css } from 'react-emotion';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

const PortraitContainer = css`
  height: 80px;
  width: 100%;
  flex-direction: row;
`;

const LandscapeContainer = css`
  height: 100%;
  width: 80px;
  flex-direction: column
`;

const Container = styled('nav')`
  ${({ orientation }) => (orientation === 'landscape' ? LandscapeContainer : PortraitContainer)}
  background-color: black;
  z-index: 999;
  top: 0px;
  position: relative;
  opacity: 0.5;
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: 900px) {
    // display: none;
  }
`;

const Padding = styled('div')`
  height: calc(100% - 50px);
  width: 100%;
  // background-color: orange;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  // margin-left: -10px;
  flex-direction: ${({ orientation }) => (orientation === 'landscape' ? 'column-reverse' : 'row')};
`;

const Component = ({ children, history, deviceStateStore: device }) => {
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

Component.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
};

Component.defaultProps = {

};

export default inject('deviceStateStore')(observer(Component));
