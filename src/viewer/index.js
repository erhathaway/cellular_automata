import { css } from 'emotion';
import GenerationMaker from '../automata';
import OneDimensionViewer from './1d';
import TwoDimensionViewer from './2d';

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


const app = {
  $cell: true,
  class: className,
  id: 'automata-viewer',

  // automata model
  _dimension: '1D',
  _neighbors: undefined,
  _populationSize: 500,
  _populationShape: undefined,
  _growth: undefined,
  _generationsToShow: 500,
  _edges: undefined,
  _initGenerationMaker: function() {
    this._generationMaker = new GenerationMaker()
  },
  _setRule: function(rule) {
    this._generationMaker.rule = rule;
  },
  // _population: function() {
  //   const dimensions = Object.values(this._populationShape);
  //   return dimensions.reduce((acc, size) => acc * size, 1);
  // },
  _setDimension: function(value) {
    if (this._dimension !== value) {
      this._dimension = value;
      this._setViewer();
    }
  },
  _setNeighbors: function(value) { this._neighbors = +value; },
  _setPopulation: function(value) { this._populationSize = +value }, // this._viewer.setPopulationCount(this._populationSize); },
  _setGrowth: function(value) { this._growth = +value; },
  _setGenerations: function(value) { this._generationsToShow = +value; this._runSimulation(); },
  _setEdges: function(value) { this._edges = +value; },

  _populationHistory: [],
  _cellDimension: 10,
  _isRunning: false,
  _runSimulationID: undefined,
  _viewer: undefined,
  _calcCellDimensions: function(e) {
    const { width } = this.getBoundingClientRect();
    this._cellDimension = width / this._populationSize;
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
  _retrieveNextGeneration: undefined,
  _retrieveNextGenerationOneDimension: function() {
    const genCopy = this._populationHistory;
    const unScaledCurrentGen = genCopy.slice(-1)[0];

    const scaleDiff = this._populationSize - unScaledCurrentGen.length;
    let currentGen;

    // on view resizing we need to add filler cells or subtract existing cells
    if (scaleDiff > 0) {
      const filler = new Array(scaleDiff).fill(0)
      currentGen = [...unScaledCurrentGen, ...filler]
    } else if (scaleDiff < 0) {
      currentGen = unScaledCurrentGen.slice(0, this._populationSize)
    } else {
      currentGen = unScaledCurrentGen;
    }

    const nextGen = this._generationMaker.run(currentGen);

    const previousGens = this._populationHistory.slice(-this._generationsToShow)
    previousGens.push(nextGen)
    this._populationHistory = previousGens;

    return nextGen;
  },
  _retrieveNextGenerationTwoDimension: function() {
    const t0 = performance.now();
    const currentGen = this._populationHistory.slice(-1)[0];
    const t1 = performance.now();
    // console.log('old history acq rate', t1-t0)
    const nextGen = this._generationMaker.run(currentGen);
    const t2 = performance.now();
    // console.log('---new gen acq rate----', t2-t1)
    this._populationHistory = [nextGen];
    // console.log('next generation', nextGen)
    const t3 = performance.now();
    // console.log('add new gen rate', t3-t2)
    return nextGen;
  },
  _bulkCreateGenerations: function(numberOfVisibleGenerations) {
    if (this._populationHistory === undefined) { this._createGenesisGeneration(); }

    let generationCount;
    for (generationCount = 0; generationCount < numberOfVisibleGenerations; generationCount++ ) {
      this._viewer.addGeneration()
    }
  },
  _createGenesisGeneration: function() {
    this._populationHistory = [];
    this._viewer.setPopulationCount(this._populationSize);
    this._populationHistory = [this._generationMaker.runPopulationSeed(this._populationShape)];
  },
  _setViewer: function() {
    switch(this._dimension) {
      case '1D' :
        console.log('1d case')
        if (this._viewer && this._viewer.dimension === '1D') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 300 };
        this._retrieveNextGeneration = this._retrieveNextGenerationOneDimension;
        this._viewer = new OneDimensionViewer(this.id, this._retrieveNextGeneration);
        this._generationMaker.useOneDimensionGenerator();
        break;
      case '2D' :
        console.log('2d case')
        if (this._viewer && this._viewer.dimension === '2D') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 300, y: 300 };
        this._retrieveNextGeneration = this._retrieveNextGenerationTwoDimension;
        this._viewer = new TwoDimensionViewer(this.id, this._retrieveNextGeneration);
        this._generationMaker.useLifeLikeGenerator();
        break;
    }

    if (this._viewer !== undefined) {
      this._viewer.createScene();
      this._createGenesisGeneration();
      this._viewer.dimension === '1D' && this._bulkCreateGenerations(this._viewer.maxGenerationsToShow);
      this._runSimulation();
    }
  },
  $init: function() {
    this._initGenerationMaker();
    this._setViewer();
  }
}

export default app;
