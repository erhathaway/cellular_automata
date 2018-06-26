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

const firstGeneration = (population) =>
  [...new Array(population)]
    .map(() => Math.round(Math.random()))

function cell(state) {
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

function generation(generation){
  return {
    $type: 'div',
    class: generationClassName,
    $components: generation.map(cell.bind(this))
  }
}

const app = {
  $cell: true,
  class: className,
  id: 'automata-viewer',

  // automata model
  _rule: undefined,
  _ruleObject: ruleObject(110),
  _dimension: undefined,
  _neighbors: undefined,
  _population: 100,
  _growth: undefined,
  _generations: 50,
  _edges: undefined,
  _setRule: function(value) {
    this._rule = value;
    this._ruleObject = ruleObject(value);
    this._runSimulation();
  },
  _setDimension: function(value) { this._dimension = +value; },
  _setNeighbors: function(value) { this._neighbors = +value; },
  _setPopulation: function(value) { this._population = +value; this._runSimulation(); },
  _setGrowth: function(value) { this._growth = +value; },
  _setGenerations: function(value) { this._generations = +value; this._runSimulation(); },
  _setEdges: function(value) { this._edges = +value; },

  _gen: undefined,
  _cellDimension: 10,
  _sizeHandler: function(e) {
    const { width } = this.getBoundingClientRect();
    this._cellDimension = width / this._population;
  },
  $components: undefined,
  $update: function() {
  },
  _createNextGeneration: function() {
    const genCopy = this._gen;
    const lastGen = genCopy.slice(-1)[0];
    const nextGen = nextGeneration(lastGen, this._ruleObject);
    const previousGens = this._gen.slice(-this._generations)
    const newGens = previousGens.push(nextGen)
    this._gen = previousGens;
  },
  _visualizeData: function() {
    this.$components = this._gen.map(generation.bind(this));
  },
  _isRunning: false,
  _runSimulation: function() {
    const compStart = performance.now();
    let count = 0;
    this._sizeHandler();
    this._gen = [firstGeneration(this._population)];

    while(count < this._generations) {
      this._createNextGeneration()
      count += 1;
    }
    const compEnd = performance.now();
    console.log('finish computation', compEnd-compStart, 'ms')
    this._visualizeData();
  },
  _stopSimulation: function() {
    this._isRunning = false;
  },
  $init: function() {
    this._runSimulation();
    // this.sizeObserver = window.addEventListener("resize", this._sizeHandler)
  }
}

export default app;
