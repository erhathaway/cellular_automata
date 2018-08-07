import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  width: 100%;
  margin: 1px;
  background-color: rgba(54, 149, 217, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  margin-top: 20px;
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
