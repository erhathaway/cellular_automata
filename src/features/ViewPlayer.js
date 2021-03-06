import React from 'react';
import { observable, computed, action, decorate } from "mobx";
import { inject, observer } from 'mobx-react';
import styled from 'react-emotion';

import { router as routerService } from '../services';
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
  background-color: ${({ backgroundColor }) => backgroundColor || 'yellow' };
`;

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.elID = 'view-player-runner';
    this.viewer = undefined;

    this.automataManager = new AutomataManager();
    this.state = {
      dimension: undefined,
      viewer: undefined,
      populationShape: undefined,
      cellStates: undefined,
    };

    this.retrieveNextGeneration = this.retrieveNextGeneration.bind(this);
  }

  componentDidMount() {
    const { automataStore: { dimension, viewer, populationShape, cellStates }, location } = this.props;

    this.initalizeViewer(dimension.value, viewer.value);
    if (routerService.isAtView(location)) {
      this.runSimulation();
    }

    this.setState({
      dimension: dimension.value,
      viewer: viewer.value,
      populationShape: populationShape.shape,
      cellStates: cellStates.hslValues,
    });
  }

  componentDidUpdate({ location: previousLocation }) {
    const {
      automataStore: {
        dimension: currentDimension,
        viewer: currentViewer,
        populationShape: currentPopulationShape,
        cellStates: currentCellStates,
      },
      location: currentLocation,
    } = this.props;

    const {
      dimension: previousDimension,
      viewer: previousViewer,
      populationShape: previousPopulationShape,
      cellStates: previousCellStates,
    } = this.state;

    // determine if modal is present or not and if simulation should be run
    const currentlyAtView = routerService.isAtView(currentLocation);
    const previouslyAtView = routerService.isAtView(previousLocation);

    if (currentlyAtView !== previouslyAtView && currentlyAtView) {
      this.runSimulation();
    }

    // handle dimension updates (will need a viewer change)
    if (currentDimension.value !== previousDimension || currentViewer.value !== previousViewer) {
      this.initalizeViewer(currentDimension.value, currentViewer.value, true);
      this.setState({
        dimension: currentDimension.value,
        viewer: currentViewer.value,
      });
    }

    // handle population shape updates
    if (JSON.stringify(currentPopulationShape.shape) !== JSON.stringify(previousPopulationShape)) {
      this.automataManager.populationShape = currentPopulationShape.shape;
      this.setState({
        populationShape: currentPopulationShape.shape,
      });
    }

    // handle cell state changes (especially state color changes)
    if (JSON.stringify(currentCellStates.hslValues) !== JSON.stringify(previousCellStates)) {
      this.viewer.states = currentCellStates.value;
      this.setState({
        cellStates: currentCellStates.hslValues,
      });
    }
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

  initalizeViewer(populationDimension, viewerDimension, shouldRun = false) {
    const { automataStore: { populationShape, cellStates } } = this.props;

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
      this.viewer.states = cellStates.value;
      this.viewer.createScene();
      this.createGenesisGeneration();
      this.viewer.type === 'one-dimension' && this.bulkCreateGenerations(this.viewer.maxGenerationsToShow * 2);
      if (shouldRun) this.runSimulation();
    }
  }

  render() {
    const { automataStore } = this.props;
    const { dimension, viewer, populationShape, cellStates } = automataStore;
    const cellStateInstance = cellStates.hslValues.filter(s => s.number === 0)[0];

    return (
      <Container id={this.elID} backgroundColor={cellStateInstance.color}>
        { /* TODO correctly configure mobx to not need this trigger mobx update observation hack */}
        <div dimension={dimension.value} viewer={viewer.value} populationshape={populationShape.shape} cellstates={cellStates.hslValues}/>
      </Container>
    );
  }
}

export default inject('automataStore')(observer(Component));
