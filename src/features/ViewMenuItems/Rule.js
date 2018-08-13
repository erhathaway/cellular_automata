import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import {
  MainContainer as Container,
  AttributeHeader,
  TitleHeader,
  HeaderContainer,
  MultilineAttributeHeader,
} from './Views';

// ruleType: 'stats' = wolfram style; 'sbd' = surive born death (conways game of life style)
const Component = (props) => {
  const { automataStore: { rule } } = props;

  if (rule.value.name === 'wolfram') {
    return (
      <Container {...props}>
        <AttributeHeader>
          { rule.value.rule }
        </AttributeHeader>
        <TitleHeader>
          Rule
        </TitleHeader>
      </Container>
    );
  }

  if (rule.value.name === 'conway') {
    return (
      <Container {...props}>
        <HeaderContainer>
          <MultilineAttributeHeader prefix="S">
            { rule.value.survive.map(s => `${s} `)}
          </MultilineAttributeHeader>
          <MultilineAttributeHeader prefix="B">
            { rule.value.born.map(b => `${b} `)}
          </MultilineAttributeHeader>
        </HeaderContainer>
        <TitleHeader>
          Rule (Conway)
        </TitleHeader>
      </Container>
    );
  }

  return null;
};

Component.propTypes = {

};

export default inject('automataStore')(observer(Component));
