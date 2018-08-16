import React from 'react';
import styled from 'react-emotion';

const Container = styled('aside')`
  position: absolute;
  bottom: 0px;
  left: 0px;
  height: 60px;
  width: 70px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  color: rgba(156,156,156,1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 25px;
  border: 1px solid rgba(56,56,56,0.8);

  // background-color: rgba(0,0,0,0.4);
  background-image: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.8), rgba(0,0,0,0.77), rgba(0,0,0,0.77), rgba(0,0,0,0.72));


  &:hover {
    // background-image: linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.9), rgba(0,0,0,0.77), rgba(0,0,0,0.77), rgba(0,0,0,0.72));
    background-color: green;
    background-image: none;
    // background-image: linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1));
  }

`;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRunning: false,
    };

    this.togglePlay = this.togglePlay.bind(this);
  }

  togglePlay() {
    this.setState(state => ({ ...state, isRunning: !state.isRunning }));
  }

  render() {
    const { isRunning } = this.state;
    return (
      <Container onClick={this.togglePlay} className={isRunning ? 'fas fa-pause' : 'fas fa-play'} />
    );
  }
}
