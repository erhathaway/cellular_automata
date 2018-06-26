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
  _setDimension: function(value) { this._dimension = value; },
  _setNeighbors: function(value) { this._neighbors = value; },
  _setPopulation: function(value) { this._population = value; },
  _setGrowth: function(value) { this._growth = value; },
  _setGenerations: function(value) { this._generations = value; },
  _setEdges: function(value) { this._edges = value; },

  _gen: undefined,
  _cellDimension: 10,
  _sizeHandler: function(e) {
    const { width } = this.getBoundingClientRect();
    this._cellDimension = width / this._population;
  },
  _cellComponent: Cell,
  _generationCompnent: Generation,
  $components: undefined,
  $update: function() {
  },
  _createNextGeneration: function() {
    const genCopy = this._gen;
    const lastGen = genCopy.slice(-1)[0];
    const nextGen = nextGeneration(lastGen, this._ruleObject);
    const previousGens = this._gen.slice(-50)
    const newGens = previousGens.push(nextGen)
    // this._gen.push(nextGen)
    this._gen = previousGens;
  },
  _visualizeData: function() {
    this.$components = this._gen.map(this._generationCompnent);
  },
  _isRunning: false,
  _runSimulation: function() {
    console.log(this._population)
    this._isRunning = true;
    let count = 0;
    console.log('running simulation')
    this._sizeHandler();
    this._gen = [firstGeneration(this._population)];
    // const arr = new Array(this._generations).fill(null);
    // arr.forEach(this._createNextGeneration);
    let shouldGrow = true;
    const isRunning = () => { return this._isRunning }
    while(count < this._generations) {
    // while(shouldGrow) {
      console.log('isRunning', isRunning())
      this._createNextGeneration()
      count += 1;
      shouldGrow = isRunning()
    }
    this._visualizeData();
  },
  _stopSimulation: function() {
    this._isRunning = false;
  },
  $init: function() {
    // this._runSimulation();
    // this.sizeObserver = window.addEventListener("resize", this._sizeHandler)
  }
}

export default app;
