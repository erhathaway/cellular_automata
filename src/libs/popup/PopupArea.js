import React from 'react';
import PropTypes from 'prop-types';

const PORTAL_ID = 'popup-area';

const Component = ({ id, style }) => (
  <div style={{ height: '100%', width: '100%', position: 'relative', ...style }} id={`${id || PORTAL_ID}`} />
);

Component.propTypes = {
  id: PropTypes.string,
};

Component.defaultProps = {
  id: undefined,
};

export default Component;
