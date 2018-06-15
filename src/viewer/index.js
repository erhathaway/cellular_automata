import { css } from 'emotion';
import { ruleObject, nextGeneration } from '../automata';

const className = css`
  background-color: lightcyan;
  height: 50%;
  width: 90%;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
`;

const generationClassName = css`
  display: flex;
  width: 100%;
  height: 10px;
`;

const firstGeneration = (cellCount) =>
  [...new Array(cellCount)]
    .map(() => Math.round(Math.random()))

const Cell = state => ({
  $type: 'div',
  style: `
    background-color: ${state === 0 ? "transparent" : "black"};
    height: 10px;
    width: 10px;
  `
})

const Generation = generation => ({
  $type: 'div',
  class: generationClassName,
  $components: generation.map(Cell)
})

const app = {
  $cell: true,
  class: className,
  _ruleObject: ruleObject(110),
  _cellCount: 100,
  _gen: undefined,
  onclick: function() {
    const lastGen = this._gen.slice(-1)[0];
    const nextGen = nextGeneration(lastGen, this._ruleObject);
    this._gen.push(nextGen)
  },
  $components: undefined,
  $update: function() { this.$components = this._gen.map(Generation) },
  $init: function() {
    this._gen = [firstGeneration(this._cellCount)]
  }
}

export default app;
