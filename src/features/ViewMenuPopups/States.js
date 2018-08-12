import React from 'react';
import styled from 'react-emotion';
import PropTypes from 'prop-types';

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
  border-bottom: 1px solid gray;
  color: white;
  font-size: 12px;
  letter-spacing: 3px;
`;

const States = styled('div')`
  display: flex;
  flex-direction: column;
  width: 200px;
  align-items: space-between;
`;

class Component extends React.Component {
  static sortNewCellStates(cellStates) {
    return cellStates.sort((s1, s2) => {
      if (s1.state > s2.state) return 1;
      if (s1.state < s2.state) return -1;
      return 0;
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      cellStates: [
        { state: 0, color: 'white' },
        { state: 1, color: 'black' },
      ],
    };

    this.onChangeComplete = this.onChangeComplete.bind(this);
  }

  shouldComponentUpdate(_, nextState) {
    // TODO: dont use this method - temp fix: for some reason the rerender of this component
    // is creating a new instance rather than reusing the same one,
    if (this.state === nextState) return true;
    return false;
  }

  onChangeComplete(cellStateNumber) {
    return (color) => {
      this.updateCellColor(cellStateNumber, color);
    };
  }

  addCellState(cellStateNumber, color) {
    const { cellStates } = this.state;
    const exists = cellStates.find(s => s.state === cellStateNumber);

    if (!exists) {
      const newCellStates = Component.sortNewCellStates([
        ...cellStates,
        { state: cellStateNumber, color },
      ]);

      this.setState(state => (
        {
          ...state,
          cellStates: newCellStates,
        }
      ));
    }
  }

  updateCellColor(cellStateNumber, color) {
    const { cellStates } = this.state;
    const filteredCellStates = cellStates.filter(s => s.state !== cellStateNumber);
    const newCellStates = Component.sortNewCellStates([
      ...filteredCellStates,
      { state: cellStateNumber, color },
    ]);

    this.setState(state => ({ ...state, cellStates: newCellStates }));
  }

  removeCellState(cellStateNumber) {
    const { cellStates } = this.state;
    const filteredCellStates = cellStates.filter(s => s.state !== cellStateNumber);
    const newCellStates = Component.sortNewCellStates(filteredCellStates);

    this.setState(state => ({ ...state, cellStates: newCellStates }));
  }

  render() {
    const { cellStates } = this.state;
    // set the parent popups exclusion coords
    // as this child popups coords so it doesn't close when clicked
    const { setExclusionCoords } = this.props;

    return (
      <Container {...this.props} height="250px" width="300px">
        <Title>
          {'Population Size Per Dimension'}
        </Title>
        <Key>
          <KeyValue>
            #
          </KeyValue>
          <KeyValue>
            Color
          </KeyValue>
        </Key>
        <States>
          { cellStates.map(({ state, color }) => (
            <StatesLineItem
              key={`cell-state-${state}-${color}`}
              onChangeComplete={newColor =>
                this.updateCellColor(state, newColor)
              }
              setPopupCoords={setExclusionCoords}
              label={state}
              color={color}
            />
          ))}
        </States>
      </Container>
    );
  }
}

Component.propTypes = {
  setExclusionCoords: PropTypes.func.isRequired,
};

export default Component;
