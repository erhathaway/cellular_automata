import React from 'react';

const PORTAL_ID = 'popup-area';

export default ({ id }) => (
  <div id={`${id ? id : PORTAL_ID}`} />
)
