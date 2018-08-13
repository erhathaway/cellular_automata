import { types } from 'mobx-state-tree';
import uuid from 'uuid';

const WolframRule = types
  .model('WolframRule', {
    id: types.identifier,
    name: types.string,
    rule: types.number,
  })
  .actions(self => ({
    setRule(rule) {
      self.rule = rule;
    },
  }));

const ConwayRule = types
  .model('ConwayRule', {
    id: types.identifier,
    name: types.string,
    survive: types.array(types.number),
    born: types.array(types.number),
  })
  .actions(self => ({
    setBorn(born) {
      self.value = { ...self.value, b: born };
    },
    setSurvive(survive) {
      self.value = { ...self.value, s: survive };
    },
  }));

const createWolframRule = () => (
  WolframRule.create({ id: uuid(), rule: 110, name: 'wolfram' })
);

const createConwayRule = () => (
  ConwayRule.create({ id: uuid(), survive: [2, 3, 5], born: [4], name: 'conway' })
);

const Rule = types
  .model('Rule', {
    value: types.union(WolframRule, ConwayRule),
  })
  .actions(self => ({
    onDimensionChange(value) {
      const dimensionValue = value[0];
      if (dimensionValue === 1) {
        self.value = createWolframRule();
      } else if (dimensionValue === 2) {
        self.value = createConwayRule();
      } else if (dimensionValue === 3) {
        self.value = createConwayRule();
      }
    },
  }));

const RuleInstance = Rule.create({
  value: createConwayRule(),
});

export {
  Rule,
  RuleInstance,
};
