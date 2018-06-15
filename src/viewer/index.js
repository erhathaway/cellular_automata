import { css } from 'emotion';

const className = css`
  background-color: lightcyan;
  height: 50%;
  width: 90%;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
`;

const app = {
  $cell: true,
  class: className,
}

export default app;
