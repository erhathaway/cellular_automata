import { css } from 'emotion';
import { ruleObject, nextGeneration } from '../automata';
import OneDimensionViewer from './1d';

const className = css`
  background-color: black;
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
  _population: 200,
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
  _setPopulation: function(value) { this._population = +value }, // this._viewer.setPopulationCount(this._population); },
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
    // console.log('this', this._cellStates)
    const genCopy = this._cellStates;
    const lastGen = genCopy.slice(-1)[0];
    // console.log(lastGen.length)
    const diff = this._population - lastGen.length;
    let lastGenModified;
    // console.log('diff', diff)
    if (diff > 0) {
      const filler = new Array(diff).fill(0)
      lastGenModified = [...lastGen, ...filler]
    } else if (diff < 0) {
      lastGenModified = lastGen.slice(0, this._population)
    } else {
      lastGenModified = lastGen
    }

    // console.log('last gen modified', lastGenModified)

    const nextGen = nextGeneration(lastGenModified, this._ruleObject);
    const previousGens = this._cellStates.slice(-this._generations)
    const newGens = previousGens.push(nextGen)
    this._cellStates = previousGens;
    // console.log('next gen', nextGen)
    return nextGen;
  },
  _runSimulation: function() {
    this._viewer.turnSimulationOn();
  },
  _stopSimulation: function() {
    this._viewer.turnSimulationOff();
  },
  _bulkCreateGenerations: function(numberOfGenerations) {
    if (this._cellStates === undefined) { this._createGenesisGeneration(); }
    // console.log(numberOfGenerations)
    let count = 0;
    while(count < numberOfGenerations) {
      this._viewer.addGeneration()
      count += 1;
    }
  },
  _createGenesisGeneration: function() {
    const firstGeneration = calcFirstGenerationCellState(this._population);
    this._viewer.setPopulationCount(firstGeneration.length)
    this._cellStates = [firstGeneration];
  },
  $init: function() {
    this._viewer = new OneDimensionViewer(this.id, this._calcNextGenerationCellStates);
    this._createGenesisGeneration();
    this._viewer.createScene();
    this._bulkCreateGenerations(this._viewer.maxGenerations);
    this._runSimulation();
  }
}

export default app;
