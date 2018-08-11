import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  margin-bottom: 5px;
`;

export default ({ children, ...props }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { ...props }));

  return (
    <Container>
      { childrenWithProps }
    </Container>
  );
};
