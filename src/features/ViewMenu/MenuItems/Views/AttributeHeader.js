import React from 'react';
import styled from 'react-emotion';

const Container = styled('h1')`
  color: #80CBEC;
  margin: 0px;
  letter-spacing: 3px;
  width: 100%;
  text-align: left;
  padding-left: 50px;
`;

const truncateNumber = (unRoundedNumber) => {
    const number = Math.floor(unRoundedNumber);
    const mils = Math.floor(number / 1000000);
    const thousands = Math.floor((number - (mils * 1000000)) / 1000);
    const tens = Math.floor(number - (mils * 1000000) - (thousands * 1000));

    if (mils > 0) {
      const hk = thousands > 0 ? Math.floor(thousands / 100) : 0;
      return hk > 0 ? mils + '.' + hk + ' m' : mils + ' m'
    }

    if (thousands > 0) {
      const h = tens > 0 ? Math.floor(tens / 100) : 0;
      return h > 0 ? thousands + '.' + h + ' k' : thousands + ' k'
    }

    return number;
}

export default ({ children, shouldTruncateNumber }) => {
  let parsedChildren = children;
  if (shouldTruncateNumber && typeof children === 'string') {
    const number = +children;
    parsedChildren = truncateNumber(number);
  }
  return (
    <Container>
    { parsedChildren }
    </Container>
  );
}
