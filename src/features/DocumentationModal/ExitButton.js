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

const IconContainer = styled('button')`
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

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }
`

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history } = this.props;
    routerService.closeDocumentationModal(history);
  }

  render() {
    return (
      <Container>
        <IconContainer onClick={this.handleClick}>
          ❌
        </IconContainer>
      </Container>
    );
  }
}
