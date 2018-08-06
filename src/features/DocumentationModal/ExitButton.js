import React from 'react';
import styled from 'react-emotion';

import { router as routerService } from '../../services';

const Container = styled('div')`
  position: relative;
  height: 70px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled('span')`
  width: 50px;
  height: 50px;
  font-family: 'Roboto', sans-serif;
  font-weight: lighter;
  font-size: 20px;
  outline: none;
  background: none;
  border: 3px solid rgba(56, 56, 56, 0.9);
  border-radius: 50%;
  color: rgba(56, 56, 56, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }
`

const HomeIcon = styled('img')`
  height: 25px;
  background-color: rgba(56, 56, 56, 0.9);

`

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleExitClick = this.handleExitClick.bind(this);
    this.handleNavtoHomeClick = this.handleNavtoHomeClick.bind(this);
  }

  handleExitClick() {
    const { history } = this.props;
    routerService.closeModal(history);
  }

  handleNavtoHomeClick() {
    const { history } = this.props;
    routerService.openIntroModal(history);
  }

  render() {
    return (
      <Container>
        <IconContainer role="img" onClick={this.handleExitClick}>
          <i className="fas fa-times" />
        </IconContainer>
        <IconContainer role="img" onClick={this.handleNavtoHomeClick}>
          <i className="fas fa-home" />
        </IconContainer>
      </Container>
    );
  }
}
