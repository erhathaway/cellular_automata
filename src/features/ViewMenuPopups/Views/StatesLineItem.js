import React from 'react';
import styled from 'react-emotion';

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

export default ({ label, color, onClickCallback }) => (
  <Container>
    <Label>
      { label }
    </Label>
    <ColorContainer onClick={onClickCallback}>
      <Color color={color} />
    </ColorContainer>
  </Container>
);
