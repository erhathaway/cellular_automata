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
    routerStore.viewRouter.visibleFeatures !== 'Library'
      ? routerStore.viewRouter.showLibraryFeature(history)
      : routerStore.viewRouter.hideLibraryFeature(history)
  }

  render() {
    const { routerStore } = this.props;
    const openModal = routerStore.openModal;

    if (openModal) return null;
    // const isAtView = routerService.isAtView(history.location);

    return (<NavButton fontAwesomeClassName="fas fa-shopping-bag" onClick={this.handleClick} />)
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default inject('routerStore')(observer(Component));
