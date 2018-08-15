import React from 'react';
import styled from 'react-emotion';
import ReactRouterPropTypes from 'react-router-prop-types';

import { router as routerService } from '../../services';

const Container = styled('button')`
  position: relative;
  width: 200px;
  height: 70px;
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  letter-spacing: 2px;
  outline: none;
  padding: 0px;
  opacity: 0;
  border: 1px solid rgb(56,56,56);
  background: inherit;
  color: gray;
  text-transform: uppercase;
  border-radius: 1px;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }

  @media (min-width: 420px) {
    width: 300px;
  }
`;

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
    return (
      <Container onClick={this.handleClick} className="landing-start-button" {...this.props}>
        Start
      </Container>
    );
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default Component;
