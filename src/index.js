import { css } from 'emotion';

import menu from './menu';
import viewer from './viewer';
import sceneTabs from './sceneTabs';
import playButton from './playButton';
import shareButton from './shareButton';
import fullScreenButton from './fullScreenButton';
import drawer from './drawer';
import menuButton from './menuButton';

import './styles.scss';

const rootClassName = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const bodyStyles = css`
  display: flex;
  flex-grow: 1;
  width: 100vw;
  height: 100%;
  justify-content: space-between;
`;

const leftMenuClassName = css`

`;

const rightMenuClassName = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 60px;

  > * {
    margin-bottom: 30px;
  }
`;

const leftMenu = {
  class: leftMenuClassName,
  $components: [drawer],

};

const rightMenu = {
  class: rightMenuClassName,
  $components: [playButton, shareButton, fullScreenButton],
};

const body = {
  class: bodyStyles,
  $components: [leftMenu, rightMenu, viewer],
};

const app = {
  id: "root",
  $cell: true,
  class: rootClassName,
  $type: "div",
  $components: [sceneTabs, body, menuButton],
}

export default app;
