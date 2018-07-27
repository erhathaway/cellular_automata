import { PointsMaterial, Geometry, Points, Vector3 } from 'three';

import BaseClass from './base';

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}


export default class OneDimensionViewerInTwoDimensions extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'one-dimension', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.distanceToMoveOnAnimation = undefined;
    this.totalDistanceToMovePerAnimation = undefined;
    this._animationStepsPerUpdate = 2;
    this.currrentGenerationYPosition = (this.containerHeight / 2) * -1;
    this.populationShape = populationShape;
    this.padding = { top: -40, bottom: -40 };
  }

  /*******************************/
  /* REQUIRED BY PARENT CLASS */
  /*******************************/

  handleWindowResize() {
    this.updateCellShape();
  }

  // method to control how a generation is added to a scene
  addGeneration() {
    // look at the last generation added
    const lastGeneration = this.meshes.slice(-1)[0];
    let y = undefined;

    // get the y position of the generation
    if (lastGeneration !== undefined) {
      y = lastGeneration.getWorldPosition(new Vector3).y;
    }

    // if the generation doesn't exist (b/c none of have been made, or the generation is NOT above the screen - still in view, we are good to make another generation)
    if (y === undefined || y < (this.containerHeight/ 2) - this.padding.top) {
      const material = new PointsMaterial( { color: 'white', size: this.cellShape.x, sizeAttenuation: true } );
      this.materials.push(material);
      const geometry = new Geometry();
      this.geometries.push(geometry);

      const generationState = this.retrieveNextGeneration();

      if (this._populationShape.x !== generationState.length) {
        this.populationShape = { x: generationState.length };
      }

      const xOffset = this.containerWidth / 2;
      const startY = this.currrentGenerationYPosition; // keep track of curent y posiiton in case cell shape changes


      generationState.forEach((cellState, cellNumber) => {
        if (cellState === 1) {
          const startX = (this.cellShape.x * cellNumber) - xOffset;

          this.createPoint({ startX, startY, geometry });
        }
      });

      const pointField = new Points(geometry, material);
      pointField.position.y = startY;
      this.meshes.push(pointField);
      this.scene.add(pointField);

      this.currentGenerationCount += 1;
      this.currrentGenerationYPosition += this.cellShape.y;
    }
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    // look for all deleteable generations
    for (let i = 0; i < this.meshes.length; i++) {
      const m = this.meshes[i];
      if (m === undefined) break;

      // get world position of generation
      const meshY = m.getWorldPosition(new Vector3).y;

      // if the generation is off the screen, delete it
      if (meshY < ((-this.containerHeight / 2) + this.padding.bottom)) {
        this.scene.remove(this.camera)
        const mesh = this.meshes.shift();
        this.cleanUpRefsByMesh(mesh);
      // otherwise, break out since generations should be ordered
      } else {
        break;
      }
    }
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {

  }

  // method to control what happens on each render update
  updateFn() {
    this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
    this.addGeneration(); // atempt to add a generation if the view is full already

    if (this.totalDistanceToMovePerAnimation <= 0) { // if there is nothing left to move, add a generation;
      this.resetTotalDistanceToMovePerAnimation();
    } else {
      this.scene.translateY(-this.distanceToMoveOnAnimation);
      this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
    }
  }

  // should set the cellShape attribute '{ x: INT } | { x: INT, y: INT } | { x: INT, y: INT, z: INT}'
  // can be used for things like reconfiguring how many steps to move per animation step and reseting total distance moved per animation to make sure steps are reconfigured when size changes
  updateCellShape(cellShape) {
    if (cellShape) {
      this.cellShape = cellShape;
    }
    else {
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter };
    }

    this.updateDistanceToMoveOnAnimation();
    this.resetTotalDistanceToMovePerAnimation();
  }

  // ex: { x: 100 } or { x: 100, y 200 }
  set populationShape(populationShape) {
    this._populationShape = populationShape;
    this.updateCellShape()
  }

  /*******************************/
  /* CUSTOM METHODS */
  /*******************************/

  createPoint = ({ startX, startY, geometry }) => {
    const vertex = new Vector3();
    vertex.x = startX;
    vertex.z = 0;

    geometry.vertices.push(vertex);
  }

  resetTotalDistanceToMovePerAnimation() {
    this.totalDistanceToMovePerAnimation = this.cellShape.x;
  }

  set animationStepsPerUpdate(steps) {
    this._animationStepsPerUpdate = steps;
    this.updateDistanceToMoveOnAnimation();
  }

  updateDistanceToMoveOnAnimation() {
    this.distanceToMoveOnAnimation = this.cellShape.x / this._animationStepsPerUpdate;
  }

  get maxGenerationsToShow() {
    const max = Math.ceil(this.containerHeight / this.cellShape.y) + 2;
    return max;
  }
}
