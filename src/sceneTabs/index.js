import { css } from 'emotion';
import './styles.scss'

const tabHTML = `
  {{tabName}}
  <span class="mdc-tab__indicator"></span>
`;

const tab = function(tabName) { return {
  $type: 'a',
  id: `${tabName}-tab`,
  class: 'mdc-tab',
  $text: tabName,
  _tabName: tabName,
  onclick: function() { this._setActiveTab(this._tabName) },
  $html: Handlebars.compile(tabHTML)({ tabName }),
  $init: function() { this._updateActiveState() },
  _updateActiveState: function() {
    if (this._activeTab === this._tabName) {
      const classes = this.classList.add('mdc-tab--active')
    } else {
      this.classList.remove('mdc-tab--active')
    }
  }
}}

const app = {
  $cell: true,
  $type: 'nav',
  class: 'mdc-tab-bar',
  _activeTab: 'View',
  _setActiveTab: function(tabName) { this._activeTab = tabName },
  id: "sceneTabs",
  _updateComponents: function() { this.$components.forEach(c => c._updateActiveState()) },
  $update: function() { this._updateComponents() },
  $components: [tab('View'), tab('Explore')],
}

export default app;
