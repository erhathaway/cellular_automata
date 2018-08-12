import React from 'react';
import styled from 'react-emotion';
import { SketchPicker } from 'react-color'


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
  margin-left: 20px;
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

export default ({ label, color, setPopupCoords, onChangeComplete }) => (
  <Container>
    <Label>
      { label }
    </Label>
    <PopupManager setPopupCoords={setPopupCoords} popupName={`states-color-picker-${label}`} component={<SketchPicker color={color} onChangeComplete={onChangeComplete} />}>
      <ColorContainer>
        <Color color={color} />
      </ColorContainer>
    </PopupManager>
  </Container>
);
