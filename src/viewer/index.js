import { css } from 'emotion';
import { ruleObject, nextGeneration } from '../automata';
import OneDimensionViewer from './1d';

const className = css`
  position: absolute;
  z-index: -1;
  left: 0px;
  top: 0px;
  height: 100vh;
  width: 100vw;
  border-radius: 3px;
  // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  box-shadow: #000000b8 3px 4px 18px 1px;
  // overflow-y: auto;
`;

const generationClassName = css`
  display: flex;
  width: 100%;
`;

const calcFirstGenerationCellState = (population) =>
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
  _generations: 500,
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

  _cellStates: undefined,
  _cellDimension: 10,
  _isRunning: false,
  _runSimulationID: undefined,
  _viewer: undefined,
  _calcCellDimensions: function(e) {
    const { width } = this.getBoundingClientRect();
    this._cellDimension = width / this._population;
  },
  $components: undefined,
  _changeRunningState: function(shouldRun) {
    if (shouldRun === true) {
      this._runSimulation();
    } else if (shouldRun === false) {
      this._stopSimulation();
    }
  },
  _calcNextGenerationCellStates: function() {
    const genCopy = this._cellStates;
    const lastGen = genCopy.slice(-1)[0];
    const nextGen = nextGeneration(lastGen, this._ruleObject);
    const previousGens = this._cellStates.slice(-this._generations)
    const newGens = previousGens.push(nextGen)
    this._cellStates = previousGens;
  },
  _visualizeData: function() {
    const nextGenToVisualize = this._cellStates.slice(-1)[0];
    this._viewer.addGeneration({ generationState: nextGenToVisualize });
  },
  _runSimulation: function() {
    if (this._isRunning === false) { this._isRunning = true; }
    if (this._runSimulationID === undefined) {
      this._runSimulationID = setInterval(function() {
        this._calcNextGenerationCellStates()
        this._visualizeData();
      }.bind(this), 100)
    }
  },
  _stopSimulation: function() {
    if (this._runSimulationID) {
      clearInterval(this._runSimulationID)
      this._runSimulationID = undefined;
    }
  },
  _bulkCreateGenerations: function(numberOfGenerations) {
    if (this._cellStates === undefined) { this._createGenesisGeneration(); }

    let count = 0;
    while(count < numberOfGenerations) {
      this._calcNextGenerationCellStates()
      this._visualizeData();
      count += 1;
    }
  },
  _createGenesisGeneration: function() {
    this._cellStates = [calcFirstGenerationCellState(this._population)];
  },
  $init: function() {
    this._viewer = new OneDimensionViewer(this.id);
    this._viewer.createScene();
    this._bulkCreateGenerations(100);
    this._runSimulation();
  }
}

export default app;
