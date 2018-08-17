import React from 'react';
import styled from 'react-emotion';
import PropTypes from 'prop-types';

const Container = styled('button')`
  height: 70px;
  width: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  font-weight: lighter;
  font-size: 25px;
  outline: none;
  background: none;
  border: none;
  color: #808080ad;

  &:hover {
    color: green;
    cursor: pointer;
  }
`;

const Component = ({ onClick, fontAwesomeClassName }) => (
  <Container role="img" onClick={onClick}>
      <i className={fontAwesomeClassName} />
  </Container>
);

Component.propTypes = {
  onClick: PropTypes.func.isRequired,
  fontAwesomeClassName: PropTypes.string.isRequired,
};

export default Component;
