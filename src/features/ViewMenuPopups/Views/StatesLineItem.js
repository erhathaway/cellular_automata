import React from 'react';
import styled from 'react-emotion';
import { SketchPicker } from 'react-color'
import { inject, observer } from 'mobx-react';

import { PopupManager } from '../../../libs/popup';

const Container = styled('div')`
  height: 40px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const Label = styled('div')`
  height: 30px;
  color: white;
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 5px;
  margin-left: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
`;

const ColorContainer = styled('div')`
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 5px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
`;

const Color = styled('div')`
  height: 30px;
  width: 30px;
  border: 1px solid white;
  margin-right: 5px;
  background-color: ${({ color }) => color || 'white'};
`;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.handleColorChange = this.handleColorChange.bind(this);
  }

  handleColorChange({ hsl: color }) {
    const { number: stateNumber, automataStore: { cellStates } } = this.props;
    // const cellStateInstance = cellStates.value.find(s => s.id === stateID);

    cellStates.setColor(stateNumber, color);
  }

  render() {
    const { setPopupCoords, number: stateNumber, automataStore: { cellStates } } = this.props;
    const cellStateInstance = cellStates.hslValues.filter(s => s.number === stateNumber)[0];
    return (
      <Container>
        <Label>
          { cellStateInstance.number }
        </Label>
        <PopupManager
          setPopupCoords={setPopupCoords}
          popupName={`states-color-picker-${stateNumber}`}
          component={<SketchPicker color={cellStateInstance.hsla} onChange={this.handleColorChange} />}
        >
          <ColorContainer>
            <Color color={cellStateInstance.color} />
          </ColorContainer>
        </PopupManager>
      </Container>
    )
  }
};

export default inject('automataStore')(observer(Component));
