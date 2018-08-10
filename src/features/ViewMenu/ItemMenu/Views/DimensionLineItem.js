import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  height: 30px;
  width: 100%;
  display: flex;
  align-items: flex-end;
`;

const Label = styled('div')`
  height: 30px;
  width: 20px;
  margin-right: 20px;
  color: white;
  display: flex;
  align-items: flex-end;
  flex-grow: 1;
`;

const Input = styled('input')`
  height: 30px;
  // width: 120px;
  background: none;
  border: none;
  outline: none;
  color: white;
  border-bottom: 1px solid gray;
  display: flex;
  justify-content: flex-end;
  flex-grow: 2;
`;

export default ({ label, value }) => (
  <Container>
    <Label>
      { label }
    </Label>
    <Input value={value} type="number"/>
  </Container>
);
