import React from 'react';
import styled from 'react-emotion';

import { Container, Title, StatesLineItem } from './Views';

const Key = styled('div')`
  display: flex;
  width: 200px;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const KeyValue = styled('div')`
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 5px;
  margin-left: 20px;
  margin-right: 20px;
  // margin-bottom: 10px;
  border-bottom: 1px solid gray;
  color: white;
`;

const States = styled('div')`
  display: flex;
  flex-direction: column;
  width: 200px;
  align-items: space-between;
`;

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cellStates: [
        { state: 0, color: 'white'},
        { state: 1, color: 'black'},
      ],
    };
  }

  addCellState(state, color) {
    const { cellStates } = this.states;
    const exists = cellStates.find(s => s.state === state);

    if (!exists) {
      this.setState(state => (
        {
          ...state,
          cellStates: [...cellStates, { state, color }],
        }
      ));
    }
  }

  removeCellState(cellStateNumber) {
    const { cellStates } = this.states;
    const newCellStates = cellStates.filter(s => s.state !== cellStateNumber);
    this.setState(state => ({ ...state, cellStates: newCellStates }));
  }

  render() {
    const { cellStates } = this.state;
    // set the parent popups exclusion coords as this child popups coords so it doesn't close when clicked
    const { setExclusionCoords } = this.props;

    return (
      <Container {...this.props} height="250px" width="300px">
        <Title>
          {'Population Size Per Dimension'}
        </Title>
        <Key>
          <KeyValue>
            State
          </KeyValue>
          <KeyValue>
            Color
          </KeyValue>
        </Key>
        <States>
          { cellStates.map(({ state, color }, i) => (
            <StatesLineItem key={`cell-state-${state}-${color}`} setPopupCoords={setExclusionCoords} label={state} color={color} />
          ))}
        </States>
      </Container>
    );
  }
}
