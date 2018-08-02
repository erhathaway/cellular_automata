import React from 'react';
import styled from 'react-emotion';

import { router as routerSerivce } from '../../services';

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
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0px'};
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

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history } = this.props;
    routerSerivce.navToView(history);
  }

  render() {
    return (
      <Container onClick={this.handleClick} className="landing-start-button" {...this.props}>
        Start
      </Container>
    );
  }
}
