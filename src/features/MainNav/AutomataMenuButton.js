import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';

import { router as routerService } from '../../services';

import { NavButton } from './Views';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history } = this.props;
    routerService.navToView(history);
  }

  render() {
    return (<NavButton fontAwesomeClassName="fas fa-stroopwafel" onClick={this.handleClick} />)
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default Component;
