import React from 'react';
import styled from 'react-emotion';

import { router as routerService } from '../../services';

const Container = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  margin-bottom: 50px;
`;

const ButtonContainer = styled('div')`
  hieght: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
  border: 1px solid rgba(56, 56, 56, 0.6);
  padding: 10px;
  padding-left: 15px;
  padding-right: 15px;
  color: white;

  &:hover {
    border-color: green;
    color: green;
    cursor: pointer;
  }
`;

const PageButton = styled('button')`
  color: inherit;
  background: none;
  outline: none;
  padding: 10px;
  border: none;
  letter-spacing: 3px;

  &:hover {
    cursor: pointer;
  }
`;

const Arrow = styled('div')`
  font-size: 30px;
`;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(pageRouterName) {
    const { history } = this.props;
    routerService.openDocumentationModalPage(history, pageRouterName);
  }

  render() {
    const { history } = this.props;

    const prevPage = routerService.getPreviousDocumentationPage(history.location);
    const nextPage = routerService.getNextDocumentationPage(history.location);

    return (
      <Container className="landing-start-button" {...this.props}>
        { prevPage && (
          <ButtonContainer onClick={() => this.handleClick(prevPage.pageRouterName)}>
            <Arrow>
            ←
            </Arrow>
            <PageButton>
              { prevPage.pageDisplayName }
            </PageButton>
          </ButtonContainer>
        )}
        { nextPage && (
          <ButtonContainer onClick={() => this.handleClick(nextPage.pageRouterName)}>
            <PageButton>
              { nextPage.pageDisplayName }
            </PageButton>
            <Arrow>
            →
            </Arrow>
          </ButtonContainer>
        )}
      </Container>
    );
  }
}
