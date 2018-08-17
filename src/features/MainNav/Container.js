import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

const Container = styled('nav')`
  height: 100%;
  width: 80px;
  background-color: black;
  z-index: 999;
  top: 0px;
  // position: relative;
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

`;

const Component = ({ children, history }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { history }));

  return (
    <Container>
      <Padding>
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

export default inject('automataMenuStore')(observer(Component));
