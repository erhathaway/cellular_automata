import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';

import { router as routerService } from '../../services';

import { NavButton } from './Views';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history, routerStore } = this.props;
    routerStore.viewRouter.isFeatureVisible('library')
      ? routerStore.viewRouter.hideLibraryFeature(history)
      : routerStore.viewRouter.showLibraryFeature(history)
  }

  render() {
    const { routerStore } = this.props;
    // the stack means there is something obstructing the view of the view scene and we shouldn't allow users to toggle
    // settings for the scene
    const stackExists = routerStore.topOfStack;

    if (stackExists) return null;
    return (<NavButton fontAwesomeClassName="fas fa-shopping-bag" onClick={this.handleClick} />)
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default inject('routerStore')(observer(Component));
