import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  height: 30px;
  width: 80px;
`;

const Label = styled('div')`
  height: 30px;
  width: 80px;
`;

const Input = styled('input')`
  height: 30px;
  width: 80px;
`;

export default ({ label }) => (
  <Container>
    <Label>
      { label }
    </Label>
    <Input />
  </Container>
);
