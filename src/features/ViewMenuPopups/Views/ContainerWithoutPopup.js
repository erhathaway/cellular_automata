import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
  background-image: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.7), rgba(0,0,0,0.67), rgba(0,0,0,0.67), rgba(0,0,0,0.62));

  margin: 3px;
  border-radius: 1px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default ({ show, children, height, width, ...props }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, props));

  return (
      <Container style={{ height, width }}>
        { childrenWithProps }
      </Container>
  );
};
