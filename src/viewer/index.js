import { css } from 'emotion';
import { ruleObject, nextGeneration } from '../automata';

const className = css`
  background-color: lightcyan;
  position: absolute;
  z-index: -1;
  left: 0px;
  top: 0px;
  height: 100%;
  width: 100%;
  border-radius: 3px;
  // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  box-shadow: #000000b8 3px 4px 18px 1px;
  // overflow-y: auto;
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
      // border-radius: ${this._cellDimension/2}px;
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
  id: 'automata-viewer',
  // automata model
  _rule: undefined,
  _dimension: undefined,
  _neighbors: undefined,
  _population: undefined,
  _growth: undefined,
  _generations: undefined,
  _edges: undefined,
  _setRule: function(value) { this._rule = value;_},
  _setDimension: function(value) { this._dimension = value;_},
  _setNeighbors: function(value) { this._neighbors = value;_},
  _setPopulation: function(value) { this._population = value;_},
  _setGrowth: function(value) { this._growth = value;_},
  _setGenerations: function(value) { this._generations = value;_},
  _setEdges: function(value) { this._edges = value;_},

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
  $update: function() {
    this.$components = this._gen.map(this._generationCompnent)
    console.log(this._rule)
  },
  $init: function() {
    this._sizeHandler();
    // this.sizeObserver = window.addEventListener("resize", this._sizeHandler)
    this._gen = [firstGeneration(this._cellCount)]
    const arr = new Array(40).fill(null)
    arr.forEach(this.onclick)
  }
}

export default app;
