import { css } from 'emotion';

import menu from './menu';
import viewer from './viewer';

const className = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const app = {
  $cell: true,
  class: className,
  $type: "div",
  $components: [viewer, menu],
}

export default app;
