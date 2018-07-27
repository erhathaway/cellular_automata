import { css } from 'emotion';
import GenerationMaker from '../automata';
import OneDimensionViewerInTwoDimensions from './OneDimensionInTwoDimensions';
import TwoDimensionViewerInTwoDimensions from './TwoDimensionInTwoDimensions';
import TwoDimensionViewerInThreeDimensions from './TwoDimensionInThreeDimensions';

const className = css`
  background-color: white;
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
  _viewerType: '2Din3D',
  _neighbors: undefined,
  _populationSize: 500,
  _populationShape: undefined,
  _growth: undefined,
  _populationHistorySize: 500,
  _edges: undefined,
  _initGenerationMaker: function() {
    this._generationMaker = new GenerationMaker()
  },
  _setRule: function(rule) {
    this._generationMaker.rule = rule;
  },
  _setDimension: function(value) {
    // if (this._viewerType !== value) {
    //   this._viewerType = value;
    //   this._setViewer();
    // }
  },
  _setNeighbors: function(value) { this._neighbors = +value; },
  _setPopulation: function(value) { this._populationSize = +value }, // this._viewer.setPopulationCount(this._populationSize); },
  _setGrowth: function(value) { this._growth = +value; },
  _setGenerations: function(value) { this._populationHistorySize = +value; this._runSimulation(); },
  _setEdges: function(value) { this._edges = +value; },

  _populationHistory: [],
  _currentPopulation: undefined,
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

    const scaleDiff = this._populationSize - this._currentPopulation.length;
    let currentGen;

    // on view resizing we need to add filler cells or subtract existing cells
    if (scaleDiff > 0) {
      const filler = new Array(scaleDiff).fill(0)
      this._currentPopulation = [...this._currentPopulation, ...filler]
    } else if (scaleDiff < 0) {
      this._currentPopulation = this._currentPopulation.slice(0, this._populationSize)
    } else {
      this._currentPopulation = this._currentPopulation;
    }

    this._currentPopulation = this._generationMaker.run(this._currentPopulation);

    // save current population to history
    // resize history to width of generationsToShow variable
    const binCurrentPopulation = this._convertArrayStateDataToBinaryString(this._currentPopulation);
    const previousGens = this._populationHistory.slice(-this._populationHistorySize)
    previousGens.push(binCurrentPopulation)
    this._populationHistory = previousGens;

    return this._currentPopulation;
  },
  _convertArrayStateDataToBinaryString: function(arr) {
    if (Array.isArray(arr[0])) return arr.map(this._convertArrayStateDataToBinaryString);

    return arr.map(i => i.toString(2)).join('');
  },
  _retrieveNextGenerationTwoDimension: function() {
    // create new population
    // if (this._populationHistory.length === this._populationHistorySize) {
    //   this._currentPopulation = this._populationHistory.shift()
    //   this._currentPopulation = this._currentPopulation.map(x => x.split('').map(x => +x));
    // } else {
      this._currentPopulation = this._generationMaker.run(this._currentPopulation);
    // }

    // save new population to history
    // resize history to width of generationsToShow variable
    const binCurrentPopulation = this._convertArrayStateDataToBinaryString(this._currentPopulation)
    const previousGens = this._populationHistory.slice(-this._populationHistorySize)
    previousGens.push(binCurrentPopulation)
    this._populationHistory = previousGens;
    return this._currentPopulation;
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
    this._currentPopulation = this._generationMaker.runPopulationSeed(this._populationShape);
    this._populationHistory = [this._convertArrayStateDataToBinaryString(this._currentPopulation)];
  },
  _setViewer: function() {
    switch(this._viewerType) {
      case '1D' :
        console.log('1d case')
        if (this._viewer && this._viewer.type === 'one-dimension') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 300 };
        this._populationHistorySize = 1500;
        this._retrieveNextGeneration = this._retrieveNextGenerationOneDimension;
        this._viewer = new OneDimensionViewerInTwoDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._generationMaker.useOneDimensionGenerator();
        break;
      case '2D' :
        console.log('2d case')
        if (this._viewer && this._viewer.type === 'two-dimension-in-two-dimensions') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 400, y: 200 };
        this._populationHistorySize = 2;
        this._retrieveNextGeneration = this._retrieveNextGenerationTwoDimension;
        this._viewer = new TwoDimensionViewerInTwoDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._generationMaker.useLifeLikeGenerator();
        break;
      case '2Din3D' :
        console.log('2Din3D case')
        if (this._viewer && this._viewer.type === 'two-dimension-in-three-dimensions') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 100, y: 200 };
        this._populationHistorySize = 180;
        this._retrieveNextGeneration = this._retrieveNextGenerationTwoDimension;
        this._viewer = new TwoDimensionViewerInThreeDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._generationMaker.useLifeLikeGenerator();
        break;
    }

    if (this._viewer !== undefined) {
      this._viewer.createScene();
      this._createGenesisGeneration();
      this._viewer.type === 'one-dimension' && this._bulkCreateGenerations(this._viewer.maxGenerationsToShow * 2);
      this._runSimulation();
    }
  },
  $init: function() {
    this._initGenerationMaker();
    this._setViewer();
  }
}

export default app;
