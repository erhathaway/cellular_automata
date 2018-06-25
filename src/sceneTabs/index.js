import { css } from 'emotion';
import { MDCRipple } from '@material/ripple';

import './styles.scss'

const selectedTabStyles = css`
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  background-color: rgba(225, 169, 0, 1);
`;

const unselectedTabStyles = css`
    background-color: #ffc107f5;

  &:hover {
    background-color: rgba(225, 169, 0, 1);
  }
`;

const tabStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 170px;
  height: 60px;
  -webkit-font-smoothing: antialiased;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 2px 10px, rgba(0, 0, 0, 0.22) 2px 2px 10px;
  font-family: monospace;
  letter-spacing: 3px;
  font-size: 12px;
  color: #000000a6;
`;

const leftTabStyles = css`
  border-bottom-left-radius: 30px;
`;

const rightTabStyles = css`
  border-bottom-right-radius: 30px;
`;

const tab = function({ tabName, position }) { return {
  $type: 'div',
  id: `scene-tab__${tabName}`,
  class: tabStyles,
  $text: tabName,
  _tabName: tabName,
  onclick: function() { this._setActiveTab(this._tabName) },
  $init: function() {
    this._subscribeToRootUpdate(this._updateActiveState)
    if (position === 'left') {this.classList.add(leftTabStyles)}
    else if (position === 'right') {this.classList.add(rightTabStyles)}
    this._updateActiveState();
    // const tabRipple = new MDCRipple(document.querySelector('#scene-tab__Explore'));
    // tabRipple.unbounded = true;
  },
  _updateActiveState: function() {
    if (this._selectedTab === this._tabName) {
      this.classList.add(selectedTabStyles)
      this.classList.remove(unselectedTabStyles)
    } else {
      this.classList.remove(selectedTabStyles)
      this.classList.add(unselectedTabStyles)
    }
  }
}}

const containerStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const app = {
  $cell: true,
  $type: 'nav',
  class: containerStyles,
  id: 'sceneTabs',
  _selectedTab: 'View',
  _updateObservers: [],
  _subscribeToRootUpdate: function(fn) { this._updateObservers.push(fn) },
  _notifyObservers: function() { this._updateObservers.map(fn => fn()) },
  _setActiveTab: function(tabName) {
    this._selectedTab = tabName;
    this._notifyObservers();
  },
  $components: [tab({ tabName: 'View', position: 'left' }), tab({ tabName: 'Explore', position: 'right' })],
}

export default app;
