import { PointsMaterial, Geometry, BoxGeometry, Points, Vector3, Mesh, MeshLambertMaterial, MeshPhongMaterial, PointLight } from 'three';
import * as THREE from 'three';
import Orbit from 'three-orbit-controls';

const OrbitControls = Orbit(THREE);

import BaseClass from './base';

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}

export default class TwoDimensionViewerInTwoDimensions extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'two-dimension-in-three-dimensions', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.populationShape = populationShape;
    this.updateRateInMS = 100;
  }


  /*******************************/
  /* SPECIAL OVERRIDES OF PARENT CLASS */
  /*******************************/
  initCamera = () => {
    const CONTAINER_WIDTH =  this.containerWidth;
    const CONTAINER_HEIGHT = this.containerHeight;
    const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    const VIEW_ANGLE = 140;
    const NEAR = 0.1;
    const FAR = 8500;
    this.camera = new PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR );

    this.scene.add(this.camera);
    this.camera.position.set(0, 100, -460);
    this.camera.lookAt(this.scene.position);
    this.updateCamera();
  }

  updateScene = () => {
    this.scene.position.y = -20
  }

  /*******************************/
  /* REQUIRED BY PARENT CLASS */
  /*******************************/

  handleWindowResize() {
    this.updateCellShape();
  }

  // method to control how a generation is added to a scene
  addGeneration() {
    const material = new MeshLambertMaterial( {color: 0x8888ff} );
    const geometry = new BoxGeometry(this.cellShape.x, this.cellShape.y, this.cellShape.z);
    const singleMaterial = new MeshPhongMaterial({color: 'green', transparent: false, opacity: 1});
    const singleGeometry = new Geometry();

    this.materials.push(singleMaterial);
    this.geometries.push(singleGeometry);

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

    const startZ = this.currentGenerationCount * this.cellShape.z;

    generationState.forEach((column, columnNumber) => {
      const startX = (this.cellShape.x * columnNumber) - xOffset;

      column.forEach((cellState, cellNumber) => {
        if (cellState === 1) {
          const startY = (this.cellShape.y * cellNumber) - yOffset;

          this.createPoint({ startX, startY, startZ, geometry, material, singleGeometry });
        }
      })
    });

    singleGeometry.computeMorphNormals();
    singleGeometry.computeFaceNormals();
    singleGeometry.verticesNeedUpdate = true

    const singleMesh = new Mesh(singleGeometry, singleMaterial);
    this.meshes.push(singleMesh);
    this.scene.add(singleMesh)

    this.currentGenerationCount += 1;
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    if (this.meshes.length > 1000) { // mesh + camera
      const mesh = this.meshes[0];

      this.cleanUpRefsByMesh(mesh, true)
    }
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {
    this.light = new PointLight('yellow');
    this.light.castShadow = true;            // default false
    this.light.position.set(-100, 200, 0);
    this.light.intensity = 1;
    this.scene.add(this.light)

    this.controls = new OrbitControls(this.camera)
  }

  // method to control what happens on each render update
  updateFn() {
    this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
    this.addGeneration(); // atempt to add a generation if the view is full already


        this.camera.position.y += this.cellShape.y;
        this.camera.lookAt(this.scene.position);
        this.light.position.y += this.cellShape.y;
        this.updateCamera();

        this.controls.update()
        console.log('scene position', this.scene.position)
        console.log('camera position', this.camera.position)
  }

  // should set the cellShape attribute '{ x: INT } | { x: INT, y: INT } | { x: INT, y: INT, z: INT}'
  // can be used for things like reconfiguring how many steps to move per animation step and reseting total distance moved per animation to make sure steps are reconfigured when size changes
  updateCellShape(cellShape) {
    if (cellShape) {
      this.cellShape = cellShape;
    }
    else {
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter, z: diameter };
    }
  }

  // ex: { x: 100 } or { x: 100, y 200 }
  set populationShape(populationShape) {
    this._populationShape = populationShape;
    this.updateCellShape()
  }

  /*******************************/
  /* CUSTOM METHODS */
  /*******************************/

  createPoint = ({ startX, startY, startZ, geometry, material, singleGeometry }) => {
    const cube = new Mesh(geometry, material);
    cube.castShadow = true; //default is false
    cube.receiveShadow = true; //default
    cube.position.set(startX, startZ, startY);

    cube.updateMatrix();
    singleGeometry.merge(cube.geometry, cube.matrix);
  }
}
