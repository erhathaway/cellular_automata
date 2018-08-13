import { PointsMaterial, Geometry, Points, Vector3, Color } from 'three';

import BaseClass from './base';

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}

export default class TwoDimensionViewerInTwoDimensions extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'two-dimension-in-two-dimensions', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.populationShape = populationShape;
  }

  /*******************************/
  /* REQUIRED BY PARENT CLASS */
  /*******************************/

  handleWindowResize() {
    this.updateCellShape();
  }

  // method to control how a generation is added to a scene
  addGeneration() {
    const material = new PointsMaterial( { color: new Color('hsl(234, 70%, 40%)'), size: this.cellShape.x, sizeAttenuation: true } );
    this.materials.push(material);
    const geometry = new Geometry();
    this.geometries.push(geometry);

    const generationState = this.retrieveNextGeneration();

    if (this._populationShape.x !== generationState.length) {
      this.populationShape = { x: generationState.length };
    }

    const xOffset = this.containerWidth / 2;
    const yOffset = this.containerHeight / 2;


    /* coordinate system
    ┌─────────────────────────────┐
    │ ┌─────┐                     │
    │ │┌───┐│                     │
    │ ││ z ││                     │
    │ │└───┘│                     │
    │ │     │                     │
    │ │  y  │             x       │
    │ └─────┘                     │
    └─────────────────────────────┘
    */
    generationState.forEach((column, columnNumber) => {
      const startX = (this.cellShape.x * columnNumber) - xOffset;

      column.forEach((cellState, cellNumber) => {
        if (cellState === 1) {
          const startY = (this.cellShape.y * cellNumber) - yOffset;

          this.createPoint({ startX, startY, geometry });
        }
      })
    });

    const pointField = new Points(geometry, material);
    this.meshes.push(pointField);
    this.scene.add(pointField);

    this.currentGenerationCount += 1;
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    if (this.meshes.length > 40) { // mesh + camera
      const mesh = this.meshes[0];

      this.cleanUpRefsByMesh(mesh, true)
    }
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {

  }

  // method to control what happens on each render update for the animation
  animateUpdateFn() {
    this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
    const colorable = this.meshes.slice(-40);
    colorable.forEach((m, i) => {
      // const color = new Color(`hsl(0%, 100%, ${100/(i+1)}%)`)
      const color = new Color(`hsl(234, 70%, ${100-((i+5)*1)}%)`)
      m.material.color.set(color)
      m.position.z = (1/(i+1));
    })
    this.addGeneration(); // atempt to add a generation if the view is full already
  }

  // method to control what happens on each render update regardless if the animation is running
  renderUpdateFn() {

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
  }

  // ex: { x: 100 } or { x: 100, y 200 }
  set populationShape(populationShape) {
    this._populationShape = populationShape;
    this.updateCellShape()
  }

  customObjectsCleanup() {

  }

  /*******************************/
  /* CUSTOM METHODS */
  /*******************************/

  createPoint = ({ startX, startY, geometry }) => {
    const vertex = new Vector3();
    vertex.x = startX;
    vertex.y = startY;
    vertex.z = 0;

    geometry.vertices.push(vertex);
  }
}
