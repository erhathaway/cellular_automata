import React from 'react';
import { inject, observer } from 'mobx-react';
import styled from 'react-emotion';

import AutomataManager from '../libs/automata';

import OneDimensionViewerInTwoDimensions from '../libs/viewer/OneDimensionInTwoDimensions';
import TwoDimensionViewerInTwoDimensions from '../libs/viewer/TwoDimensionInTwoDimensions';
import TwoDimensionViewerInThreeDimensions from '../libs/viewer/TwoDimensionInThreeDimensions';
import ThreeDimensionViewerInThreeDimensions from '../libs/viewer/ThreeDimensionInThreeDimensions';

const Container = styled('div')`
  position: fixed;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
`;

class Component extends React.Component {
  constructor(props) {
    super(props)

    this.elID = 'view-player-runner';
    this.viewer = undefined;

    this.automataManager = new AutomataManager();

    this.retrieveNextGeneration = this.retrieveNextGeneration.bind(this);
  }

  componentDidMount() {
    const { automataStore: { dimension, viewer } } = this.props;
    this.initalizeViewer(dimension.value, viewer.value)
  }

  retrieveNextGeneration() {
    return this.automataManager.run();
  }

  runSimulation() {
    this.viewer.turnSimulationOn();
  }

  stopSimulation() {
    this.viewer.turnSimulationOff();
  }

  createGenesisGeneration() {
    const { automataStore: { populationShape } } = this.props;

    this.automataManager.populationShape = populationShape.shape;
    this.automataManager.getSeedPopulation();
  }

  bulkCreateGenerations(numberOfVisibleGenerations) {
    let generationCount;
    for (generationCount = 0; generationCount < numberOfVisibleGenerations; generationCount++ ) {
      this.viewer.addGeneration();
    }
  }

  initalizeViewer(populationDimension, viewerDimension) {
    const { automataStore: { populationShape } } = this.props;

    const viewerConfig = {
      containerElId: this.elID,
      populationShape: populationShape.shape,
      retrieveNextGeneration: this.retrieveNextGeneration,
    };

    if (populationDimension === 1 && viewerDimension === 2) {
      if (this.viewer && this.viewer.type === 'one-dimension') return;
      if (this.viewer) this.viewer.quit();
      this.viewer = new OneDimensionViewerInTwoDimensions(viewerConfig);
      this.automataManager.useOneDimensionGenerator();
      this.automataManager.generationHistorySize = 1500;
    }

    else if (populationDimension === 2 && viewerDimension === 2) {
      if (this.viewer && this.viewer.type === 'two-dimension-in-two-dimensions') return;
      if (this.viewer) this.viewer.quit();
      this.viewer = new TwoDimensionViewerInTwoDimensions(viewerConfig);
      this.automataManager.useLifeLikeGenerator();
      this.automataManager.generationHistorySize = 2;
    }

    else if (populationDimension === 2 && viewerDimension === 3) {
      if (this.viewer && this.viewer.type === 'two-dimension-in-three-dimensions') return;
      if (this.viewer) this.viewer.quit();
      this.viewer = new TwoDimensionViewerInThreeDimensions(viewerConfig);
      this.automataManager.useLifeLikeGenerator();
      this.automataManager.generationHistorySize = 20;
    }

    else if (populationDimension === 3 && viewerDimension === 3) {
      if (this.viewer && this.viewer.type === 'three-dimension-in-three-dimensions') return;
      if (this.viewer) this.viewer.quit();
      this.viewer = new ThreeDimensionViewerInThreeDimensions(viewerConfig);
      this.automataManager.useThreeDimensionGenerator();
      this.automataManager.generationHistorySize = 20;
    }

    if (this.viewer !== undefined) {
      this.viewer.createScene();
      this.createGenesisGeneration();
      this.viewer.type === 'one-dimension' && this.bulkCreateGenerations(this.viewer.maxGenerationsToShow * 2);
      this.runSimulation();
    }
  }

  render() {
    return (
      <Container id={this.elID} />
    );
  }
}

export default inject('automataStore')(observer(Component));
