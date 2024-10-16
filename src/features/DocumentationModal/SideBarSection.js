import React from 'react';
import styled from 'react-emotion';

import { router as routerService } from '../../services';

const Container = styled('nav')`
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(156, 156, 156, 1);
  letter-spacing: 6px;
  margin: 10px;
  padding-bottom: 10px;
  margin-right: 50px;
  ${({ isSelected }) => (isSelected && 'border-bottom: 1px solid white;')}
  ${({ isSelected }) => (isSelected && 'margin-bottom: 15px; margin-top: 10px;')}
  ${({ isSelected }) => !isSelected && '&:hover {border-color: green; color: green; cursor: pointer; }'}
`;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { history, pageRouterName, showSmallDocMenu, toggleShowingSmallDocMenu } = this.props;
    routerService.openDocumentationModalPage(history, pageRouterName);
    if (showSmallDocMenu) toggleShowingSmallDocMenu()
  }

  render() {
    const { pageDisplayName, isSelected } = this.props
    return (
      <Container onClick={this.handleClick} isSelected={isSelected}>
        { pageDisplayName }
      </Container>
    );
  }
}
