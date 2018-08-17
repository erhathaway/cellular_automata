import React from 'react';
import styled from 'react-emotion';

const Container = styled('aside')`
  height: 100%;
  width: 90px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  color: rgba(0, 0, 0, 0);
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;

  &:hover {
    background-image: linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1));
    color: rgba(156,156,156,1);
  }
`;

const Icon = styled('div')`
  // color: rgba(156,156,156,0.6);
  color: white;
  font-size: 23px;
  display: flex;
  align-items: center;
  text-align: center;
  flex-grow: 3;
`;

// const Direction = styled('p')`
//   font-size: 9px;
//   display: flex;
//   align-items: center;
//   text-align: center;
//   flex-grow: 0;
//   text-transform: uppercase;
//   letter-spacing: 2px;
// `;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRunningForward: true,
    };

    this.toggleDirection = this.toggleDirection.bind(this);
  }

  toggleDirection() {
    this.setState(state => ({ ...state, isRunningForward: !state.isRunningForward }));
  }

  render() {
    // const { isRunningForward } = this.state;
    // <Direction>
    // { isRunningForward ? 'forward' : 'backwards'}
    // </Direction>
    return (
      <Container onClick={this.toggleDirection}>
        <Icon className="fas fa-exchange-alt" />
      </Container>
    );
  }
}
