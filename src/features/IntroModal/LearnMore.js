import React from 'react';
import styled from 'react-emotion';
import ReactRouterPropTypes from 'react-router-prop-types';

import { router as routerSerivce } from '../../services';

const Container = styled('div')`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: inherit;
  border: none;
  outline: none;
  font-family: 'Roboto', sans-serif;
  color: rgb(105,105,105);
  font-size: 14px;
  letter-spacing: 3.5px;
  padding: 20px;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }

  @media (max-width: 460px) {
    margin-bottom: 65px;
  }
`;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }


  handleClick() {
    const { history } = this.props;
    routerSerivce.openDocumentationModalPage(history);
  }

  render() {
    return (
      <Container onClick={this.handleClick} className="landing-learn-more" {...this.props}>
        Learn about cellular automata
      </Container>
    );
  }
}

Component.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
};

export default Component;
