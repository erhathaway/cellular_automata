import { css } from 'emotion';
// import { ruleObject, nextGeneration } from '../automata';
import GenerationMaker from '../automata';
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
  overflow: hidden;
`;

const calcFirstGenerationCellState = (population) =>
  [...new Array(population)]
    .map(() => Math.round(Math.random()))

const app = {
  $cell: true,
  class: className,
  id: 'automata-viewer',

  // automata model
  // _rule: undefined,
  // _ruleObject: ruleObject(110),
  _dimension: '1D',
  _neighbors: undefined,
  _population: 200,
  _growth: undefined,
  _generations: 500,
  _edges: undefined,
  _initGenerationMaker: function(rule) {
    this._generationMaker = new GenerationMaker(rule)
  },
  _setRule: function(rule) {
    this._generationMaker.rule = rule;
  //   this._rule = value;
  //   // this._ruleObject = ruleObject(value);
  //   this._runSimulation();
  },
  _setDimension: function(value) { this._dimension = value; this._setViewer() },
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
  _runSimulation: function() {
    this._viewer.turnSimulationOn();
  },
  _stopSimulation: function() {
    this._viewer.turnSimulationOff();
  },
  _retrieveNextGeneration: function() {
    const genCopy = this._cellStates;
    const lastGen = genCopy.slice(-1)[0];

    const diff = this._population - lastGen.length;
    let lastGenModified;

    if (diff > 0) {
      const filler = new Array(diff).fill(0)
      lastGenModified = [...lastGen, ...filler]
    } else if (diff < 0) {
      lastGenModified = lastGen.slice(0, this._population)
    } else {
      lastGenModified = lastGen
    }

    const nextGen = this._generationMaker.run(lastGenModified);
    // const nextGen = nextGeneration(lastGenModified, this._ruleObject);
    const previousGens = this._cellStates.slice(-this._generations)
    previousGens.push(nextGen)
    this._cellStates = previousGens;

    return nextGen;
  },
  _bulkCreateGenerations: function(numberOfVisibleGenerations) {
    if (this._cellStates === undefined) { this._createGenesisGeneration(); }

    let generationCount;
    for (generationCount = 0; generationCount < numberOfVisibleGenerations; generationCount++ ) {
      this._viewer.addGeneration()
    }
  },
  _createGenesisGeneration: function() {
    const firstGeneration = calcFirstGenerationCellState(this._population);
    this._viewer.setPopulationCount(firstGeneration.length)
    this._cellStates = [firstGeneration];
  },
  _setViewer: function() {
    switch(this._dimension) {
      case '1D' :
        if (this._viewer && this._viewer.dimension === '1D') break;
        if (this._viewer) this._viewer.quit();

        this._viewer = new OneDimensionViewer(this.id, this._retrieveNextGeneration);
        break;
      case '2D' :
        if (this._viewer && this._viewer.dimension === '2D') break;
        if (this._viewer) this._viewer.quit();
        this._viewer = null;
        // this._viewer = new TwoDimensionViewer(this.id, this._retrieveNextGeneration);
        break;
    }

    if (this._viewer !== undefined) {
      console.log('here')
      // this._viewer.createScene();
      // this._runSimulation();
    }
  },
  $init: function() {
    this._initGenerationMaker(110);
    this._setViewer();
    this._createGenesisGeneration();
    this._bulkCreateGenerations(this._viewer.maxGenerationsToShow);
    this._viewer.createScene();

    this._runSimulation();
  }
}

export default app;
