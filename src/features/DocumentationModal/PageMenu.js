import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';
import { PAGES } from '../../constants';
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

  @media (max-width: 500px) {
    padding: 0px;
    margin: 0px;
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
  display: flex;
  // add to fix vertical alignment on some mobile devices
  align-items: center;
`;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.navPrevious = this.navPrevious.bind(this);
    this.navNext = this.navNext.bind(this);
  }

  navPrevious() {
    const { routerStore: { docRouter }, history } = this.props;
    docRouter.navToPreviousPage(history)
  }

  navNext() {
    const { routerStore: { docRouter }, history } = this.props;
    docRouter.navToNextPage(history)
  }

  render() {
    const { routerStore: { docRouter }, history } = this.props;
    const previous = docRouter.previousPage;
    const previousInfo = previous ? PAGES.find(p => p.id === previous.routeKey) : undefined;

    const next = docRouter.nextPage
    const nextInfo = previous ? PAGES.find(p => p.id === next.routeKey) : undefined;
    return (
      <Container className="landing-start-button" {...this.props}>
        { previousInfo && (
          <ButtonContainer onClick={this.navPrevious}>
            <Arrow>
            ←
            </Arrow>
            <PageButton>
              { previousInfo.pageDisplayName }
            </PageButton>
          </ButtonContainer>
        )}
        { nextInfo && (
          <ButtonContainer onClick={this.navNext}>
            <PageButton>
              { nextInfo.pageDisplayName }
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

export default inject('routerStore')(observer(Component));
