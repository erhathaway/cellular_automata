import { css } from 'emotion';
import AutomataManager from '../automata';
import OneDimensionViewerInTwoDimensions from './OneDimensionInTwoDimensions';
import TwoDimensionViewerInTwoDimensions from './TwoDimensionInTwoDimensions';
import TwoDimensionViewerInThreeDimensions from './TwoDimensionInThreeDimensions';
import ThreeDimensionViewerInThreeDimensions from './ThreeDimensionInThreeDimensions';

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
  _viewerType: '1D',
  _neighbors: undefined,
  _populationShape: undefined,
  _growth: undefined,
  _populationHistorySize: 500,
  _edges: undefined,
  _initAutomataManager: function() {
    this._automataManager = new AutomataManager()
  },
  _setRule: function(rule) {
    this._automataManager.rule = rule;
  },
  _setDimension: function(value) {
    // if (this._viewerType !== value) {
    //   this._viewerType = value;
    //   this._setViewer();
    // }
  },
  _setNeighbors: function(value) { this._neighbors = +value; },
  _setPopulation: function(value) { this._automataManager.populationShape = { x: +value } }, // this._viewer.setPopulationCount(this._populationSize); },
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
    this._cellDimension = width / this._populationShape.x;
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
    this._currentPopulation = this._automataManager.run();
    return this._currentPopulation;
    // {
    //   direction: 'forward' | 'reverse',
    //   population: [],
    //   shape: { x, y,...}
    //   generationNumber: INT,
    // }
  },
  _bulkCreateGenerations: function(numberOfVisibleGenerations) {
    let generationCount;
    for (generationCount = 0; generationCount < numberOfVisibleGenerations; generationCount++ ) {
      this._viewer.addGeneration()
    }
  },
  _createGenesisGeneration: function() {
    this._automataManager.populationShape = this._populationShape;
    this._automataManager.getSeedPopulation();
  },
  _setViewer: function() {
    switch(this._viewerType) {
      case '1D' :
        console.log('1d case')
        if (this._viewer && this._viewer.type === 'one-dimension') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 300 };
        this._viewer = new OneDimensionViewerInTwoDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._automataManager.useOneDimensionGenerator();
        this._automataManager.generationHistorySize = 1500;
        break;
      case '2D' :
        console.log('2d case')
        if (this._viewer && this._viewer.type === 'two-dimension-in-two-dimensions') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 200, y: 150 };
        this._viewer = new TwoDimensionViewerInTwoDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._automataManager.useLifeLikeGenerator();
        this._automataManager.generationHistorySize = 2;
        break;
      case '2Din3D' :
        console.log('2Din3D case')
        if (this._viewer && this._viewer.type === 'two-dimension-in-three-dimensions') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 10, y: 20 };
        this._viewer = new TwoDimensionViewerInThreeDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._automataManager.useLifeLikeGenerator();
        this._automataManager.generationHistorySize = 20;

        break;
      case '3Din3D' :
        console.log('3Din3D case')
        if (this._viewer && this._viewer.type === 'three-dimension-in-three-dimensions') break;
        if (this._viewer) this._viewer.quit();
        this._populationShape = { x: 23, y: 23, z: 23 };
        this._viewer = new ThreeDimensionViewerInThreeDimensions({ containerElId: this.id, populationShape: this._populationShape, retrieveNextGeneration: this._retrieveNextGeneration });
        this._automataManager.useThreeDimensionGenerator();
        this._automataManager.generationHistorySize = 20;
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
    this._initAutomataManager();
    this._setViewer();
  }
}

export default app;
