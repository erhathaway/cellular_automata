import React from 'react';
import styled from 'react-emotion';
import { inject, observer } from 'mobx-react';

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
  background: none;
  border: none;
  outline: none;
  color: white;
  border-bottom: 1px solid gray;
  display: flex;
  justify-content: flex-end;
  flex-grow: 2;
  letter-spacing: 3px;
`;

export default inject('automataStore')(observer((props) => {
  const { automataStore: { populationShape }, id } = props;
  const dimension = populationShape.shape[id];

  const { value, name } = dimension;

  const handleOnChange = ({ target: { value: newValue } }) => dimension.setValue(newValue);
  return (
    <Container>
      <Label>
        { name }
      </Label>
      <Input value={value} onChange={handleOnChange} type="number" />
    </Container>
  );
}));
