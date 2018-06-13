import { css } from 'emotion';

export default () => {
  const app = document.getElementById('root')
  const myStyle = css`
    background-color: rebeccapurple;
    height: 100px;
    width: 200px;
  `;

  app.classList.add(myStyle)
}
