import React from 'react';
import styled from 'react-emotion';
import PropTypes from 'prop-types';

const Container = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  margin-bottom: 5px;
`;

const Component = ({ children, ...props }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { ...props }));

  return (
    <Container>
      { childrenWithProps }
    </Container>
  );
};

Component.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

Component.defaultProps = {

};

export default Component;
