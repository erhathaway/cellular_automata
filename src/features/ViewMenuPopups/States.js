import React from 'react';
import styled from 'react-emotion';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import { Container, Title, StatesLineItem } from './Views';

const Key = styled('div')`
  display: flex;
  width: 200px;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const KeyValue = styled('div')`
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 5px;
  margin-left: 20px;
  margin-right: 20px;
  border-bottom: 1px solid gray;
  color: white;
  font-size: 12px;
  letter-spacing: 3px;
`;

const States = styled('div')`
  display: flex;
  flex-direction: column;
  width: 200px;
  align-items: space-between;
`;

const Component = inject('automataStore')(observer((props) => {
  // set the parent popups exclusion coords
  // as this child popups coords so it doesn't close when clicked
  const { setExclusionCoords, automataStore: { cellStates } } = props;

  return (
    <Container {...this.props} height="250px" width="300px">
      <Title>
        {'Population Size Per Dimension'}
      </Title>
      <Key>
        <KeyValue>
          #
        </KeyValue>
        <KeyValue>
          Color
        </KeyValue>
      </Key>
      <States>
        { cellStates.value.map(({ id }) => (
          <StatesLineItem
            key={`cell-state-popup-${id}`}
            setPopupCoords={setExclusionCoords}
            id={id}
          />
        ))}
      </States>
    </Container>
  );
}));


Component.propTypes = {
  setExclusionCoords: PropTypes.func.isRequired,
};

export default Component;
