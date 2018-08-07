import React from 'react';
import styled, { css } from 'react-emotion';

// dock top or bottom
const ContainerHorizontal = css`
`;

// dock left or right
const ContainerVertical = css`

`;

// has not docked
const ContainerNotDocked = css`

`;

// dock right
const ContainerVerticalRight = css`
  text-align: right;
`;

const Container = styled('h1')`
  color: #80CBEC;
  margin: 0px;
  letter-spacing: 3px;
  width: 100%;
  text-align: left;
  min-width: 70px;

  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ContainerVerticalRight)}
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

export default ({ children, shouldTruncateNumber, menuPlacement }) => {
  let parsedChildren = children;
  if (shouldTruncateNumber && typeof children === 'string') {
    const number = +children;
    parsedChildren = truncateNumber(number);
  }
  return (
    <Container menuPlacement={menuPlacement}>
    { parsedChildren }
    </Container>
  );
}
