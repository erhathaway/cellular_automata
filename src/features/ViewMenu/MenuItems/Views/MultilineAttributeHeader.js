import React from 'react';
import styled, { css } from 'react-emotion';

// dock right
const ContainerVerticalRight = css`
  flex-direction: row-reverse;
`;

const Container = styled('h1')`
  margin: 3px;
  width: 100%;
  text-align: left;
  display: flex;
  min-width: 100px;
  flex-direction: row;

  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && ContainerVerticalRight)}
`;

// dock right
const PrefixVerticalRight = css`
  border-right: 0px solid gray;
  padding-right: 0px;
  margin-right: 0px;

  border-left: 1px solid gray;
  padding-left: 8px;
  margin-left: 8px;
`;

const Prefix = styled('div')`
  color: gray;
  min-width: 5px;
  border-right: 1px solid gray;
  padding-right: 8px;
  margin-right: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;

  ${({ menuPlacement }) => (menuPlacement && (menuPlacement.includes('hasDockedRight')) && PrefixVerticalRight)}
`;

const AttributeAndSuffix = styled('div')`
  // width: 100%;
  display: flex;
`;

const Suffix = styled('div')`
  min-width: 10px;
  // padding-right: 10px;
  // margin-right: 10px;
  margin-left: 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  color: white;
`;

const Attribute = styled('a')`
  color: #80CBEC;
  letter-spacing: 3px;
`;

const truncateNumber = (unRoundedNumber) => {
  const number = Math.floor(unRoundedNumber);
  const mils = Math.floor(number / 1000000);
  const thousands = Math.floor((number - (mils * 1000000)) / 1000);
  const tens = Math.floor(number - (mils * 1000000) - (thousands * 1000));


  let result;
  let suffix;

  if (mils > 0) {
    const hk = thousands > 0 ? Math.floor(thousands / 100) : 0;
    result = hk > 0 ? `${mils}.${hk}` : `${mils}`;
    suffix = 'M';
  } else if (thousands > 0) {
    const h = tens > 0 ? Math.floor(tens / 100) : 0;
    result = h > 0 ? `${thousands}.${h}` : `${thousands}`;
    suffix = 'K';
  } else {
    result = `${number}`;
    suffix = '';
  }

  return { result, suffix };
};

export default ({ children, menuPlacement, prefix, shouldTruncateNumber, suffix }) => { // eslint-disable-line object-curly-newline, max-len
  let parsedChildren = children;
  let parsedSuffix = suffix;

  if (shouldTruncateNumber && typeof children === 'string') {
    const number = +children;
    const { result, suffix: s } = truncateNumber(number);
    parsedChildren = result;
    parsedSuffix = s;
  }
  return (
    <Container menuPlacement={menuPlacement}>
      { prefix && (
        <Prefix menuPlacement={menuPlacement}>
          { prefix }
        </Prefix>
      )}
      <AttributeAndSuffix>
      <Attribute>
        { parsedChildren }
      </Attribute>
      { parsedSuffix && (
        <Suffix>
          { parsedSuffix }
        </Suffix>
      )}
      </AttributeAndSuffix>
    </Container>
  );
};
