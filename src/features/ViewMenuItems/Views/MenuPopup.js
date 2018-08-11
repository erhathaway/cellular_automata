import React from 'react';

export default ({ popupComponent, ...props }) => {
  return React.createElement(popupComponent, {...props });
};
