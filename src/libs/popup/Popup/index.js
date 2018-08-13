import React from 'react';
import Component from './Component';

export default ({ show, ...props }) => {
  if (show) return (<Component {...props} />);
  return null;
};
