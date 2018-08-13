import React from 'react';
import styled from 'react-emotion';

const Container = styled('nav')`
  width: 250px;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex-direction: column;
  border-right: 1px solid rgba(56, 56, 56, 0.6);
  color: rgba(156, 156, 156, 1);
  letter-spacing: 8px;
`;

export default ({ children, history }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { history }));

  return (
    <Container>
      { childrenWithProps }
    </Container>
  );
};
