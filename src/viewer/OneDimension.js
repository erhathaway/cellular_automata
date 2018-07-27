import { PointsMaterial, Geometry, Points, Vector3 } from 'three';

import BaseClass from './BaseClass';

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}


export default class OneDimensionViewer extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'one-dimension', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.distanceToMoveOnAnimation = undefined;
    this.totalDistanceToMovePerAnimation = undefined;
    this._animationStepsPerUpdate = 2;
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
    const material = new PointsMaterial( { color: 'white', size: this.cellShape.x, sizeAttenuation: true } );
    this.materials.push(material);
    const geometry = new Geometry();
    this.geometries.push(geometry);

    const generationState = this.retrieveNextGeneration();

    if (this._populationShape.x !== generationState.length) {
      this.populationShape = { x: generationState.length };
    }

    const xOffset = this.containerWidth / 2;
    const yOffset = this.containerHeight / 2;
    const startY = (this.cellShape.y * this.currentGenerationCount) - yOffset;
    // console.log(startY)
    // const startY = 0;

    generationState.forEach((cellState, cellNumber) => {
      if (cellState === 1) {
        const startX = (this.cellShape.x * cellNumber) - xOffset;

        this.createPoint({ startX, startY, geometry });
      }
    });

    const pointField = new Points(geometry, material);
    // pointField.position.y = startY;
    this.meshes.push(pointField);
    this.scene.add(pointField);

    this.currentGenerationCount += 1;
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    // const firstMesh = this.meshes[0];
    // const meshY = firstMesh.getWorldPosition(new Vector3).y;
    // const sceneY = this.scene.position.y;
    //
    // const y = meshY - sceneY;
    // console.log('scene position', scenePosition)
    // console.log('yyyy', y, ' vs ', -this.containerHeight /2)
    // if (y < (-this.containerHeight / 2)) {
    //     // this.scene.remove(this.camera)
    //   const mesh = this.meshes.shift();
    //   this.cleanUpRefsByMesh(mesh);
    // }
    // if (this.scene.children[0] && this.scene.children.length > this.maxGenerationsToShow) {
    //
    //   const mesh = this.meshes.shift();
    //   console.log('mesh world position', mesh.getWorldPosition(new Vector3()))
    //   this.cleanUpRefsByMesh(mesh);
    // }

    if (this.scene.children[0] && this.scene.children.length > this.maxGenerationsToShow) {
      this.scene.remove(this.camera)

      const mesh = this.meshes.shift();
      this.cleanUpRefsByMesh(mesh);
    }
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {

  }

  // method to control what happens on each render update
  updateFn() {
    this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
    // const lastMesh = this.meshes.slice(-1)[0]
    // if (lastMesh) {
    //   lastMesh.updateMatrix();
    //   lastMesh.updateMatrixWorld(true);
    //   console.log('world to local', lastMesh.worldToLocal(new Vector3()))
    //   console.log('point', lastMesh.getWorldPosition(new Vector3()))
    //   console.log('point local', lastMesh.localToWorld(new Vector3()))
    // }
    if (this.totalDistanceToMovePerAnimation <= 0) { // if there is nothing left to move, add a generation;
      this.resetTotalDistanceToMovePerAnimation();
      this.addGeneration();
      // this.removeGeneration();
    } else {
      this.scene.translateY(-this.distanceToMoveOnAnimation);
      // this.scene.updateMatrix();
      // // this.meshes.forEach(m => m.translateY(-this.distanceToMoveOnAnimation));
      // this.scene.updateMatrixWorld(true);
      // this.scene.matrixWorldNeedsUpdate = true;
      // this.camera.updateProjectionMatrix();
      //
      // // this.scene.matrixAutoUpdate  = false;
      // // this.scene.updateMatrix();
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
    vertex.y = startY;
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
    const max = Math.ceil(this.containerHeight * 2/ this.cellShape.y) + 2;
    console.log('max', max)
    return max;
  }
}
