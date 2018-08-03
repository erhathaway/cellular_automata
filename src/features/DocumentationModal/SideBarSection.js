import React from 'react';
import styled from 'react-emotion';

import { router as routerSerivce } from '../../services';

const Container = styled('nav')`
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(156, 156, 156, 1);
  letter-spacing: 8px;
  margin: 10px;
  padding-bottom: 10px;
  margin-right: 50px;
  ${({ isActive }) => (isActive && 'border-bottom: 1px solid white;')}
  ${({ isActive }) => (isActive && 'margin-bottom: 30px; margin-top: 30px;')}

  ${({ isActive }) => !isActive && '&:hover {border-color: green; color: green; cursor: pointer; }'}
`;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history, routerName, displayName } = this.props;
    routerSerivce.navToDocumentationPage(routerName);
  }

  render() {
    const { displayName, isActive } = this.props
    return (
      <Container onClick={this.handleClick} isActive={isActive}>
        { displayName }
      </Container>
    );
  }
}
