import { css } from 'emotion';
import { ruleObject, nextGeneration } from '../automata';

const className = css`
  background-color: lightcyan;
  height: 50%;
  width: 90%;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  overflow-y: scroll;
`;

const generationClassName = css`
  display: flex;
  width: 100%;
`;

const firstGeneration = (cellCount) =>
  [...new Array(cellCount)]
    .map(() => Math.round(Math.random()))

function Cell(state) {
  return {
    $type: 'div',
    style: `
      background-color: ${state === 0 ? "transparent" : "black"};
      height: ${this._cellDimension}px;
      width: ${this._cellDimension}px;
    `
  }
}

function Generation(generation){
  return {
    $type: 'div',
    class: generationClassName,
    $components: generation.map(this._cellComponent)
  }
}

const app = {
  $cell: true,
  class: className,
  _ruleObject: ruleObject(110),
  _cellCount: 100,
  _gen: undefined,
  _cellDimension: 10,
  _sizeHandler: function(e) {
    const { height, width } = this.getBoundingClientRect();
    this._cellDimension = width / this._cellCount;
  },
  _cellComponent: Cell,
  _generationCompnent: Generation,
  onclick: function() {
    const lastGen = this._gen.slice(-1)[0];
    const nextGen = nextGeneration(lastGen, this._ruleObject);
    this._gen.push(nextGen)
  },
  $components: undefined,
  $update: function() { this.$components = this._gen.map(this._generationCompnent) },
  $init: function() {
    this._sizeHandler();
    this.sizeObserver = window.addEventListener("resize", this._sizeHandler)
    this._gen = [firstGeneration(this._cellCount)]
  }
}

export default app;
