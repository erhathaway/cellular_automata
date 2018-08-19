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
    const { history, routerStore: router } = this.props;
    router.openDocModal(history);
  }

  render() {
    return (<NavButton fontAwesomeClassName="fas fa-info" onClick={this.handleClick} />)
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default inject('routerStore')(observer(Component));