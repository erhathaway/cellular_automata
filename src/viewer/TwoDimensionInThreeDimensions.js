import {
  Geometry, BoxGeometry, PlaneGeometry,
  Vector3,
  Mesh,
  MeshLambertMaterial, MeshPhongMaterial, MeshBasicMaterial,
  PointLight, HemisphereLight, SpotLight,
  PerspectiveCamera, OrthographicCamera
} from 'three';
import * as THREE from 'three';
import Orbit from 'three-orbit-controls';

const OrbitControls = Orbit(THREE);

import BaseClass from './base';

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}

export default class TwoDimensionViewerInThreeDimensions extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'two-dimension-in-three-dimensions', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.populationShape = populationShape;
    // this.updateRateInMS = 300;
  }


  /*******************************/
  /* SPECIAL OVERRIDES OF PARENT CLASS */
  /*******************************/
  initCamera() {
    // const CONTAINER_WIDTH =  this.containerWidth;
    // const CONTAINER_HEIGHT = this.containerHeight;
    // const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    // const VIEW_ANGLE = 140;
    // const NEAR = 0.1;
    // const FAR = 8500;
    // this.camera = new PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR );
    //
    // this.scene.add(this.camera);
    // this.camera.position.set(-1000, 450, 260);
    // // this.camera.lookAt(this.scene.position);
    // this.camera.lookAt(new Vector3(1, -0.5, -0.1))

    this.camera = new OrthographicCamera( this.containerWidth / - 2, this.containerWidth / 2, this.containerHeight / 2, this.containerHeight / - 2, 1, 10000 );
    this.camera.position.set(-450, 400, 900);
    this.camera.lookAt(new Vector3(1, 0.57, -0.73))
    this.camera.zoom = 0.3
    this.updateCamera();
  }

  updateScene() {
    this.scene.position.y = 100;
    this.scene.position.z = -600;
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
    singleMesh.position.y = startZ;
    // singleMesh.castShadow = true;
    // singleMesh.recieveShadow = true;
    this.meshes.push(singleMesh);
    this.scene.add(singleMesh)

    this.currentGenerationCount += 1;
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    // if (this.meshes.length > 50) { // mesh + camera
      const mesh = this.meshes[0];
      this.scene.remove(this.camera)
      this.cleanUpRefsByMesh(mesh, true)
    // }
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {
    // this.light = new PointLight('yellow');
    // this.light.castShadow = true;            // default false
    // this.light.position.set(this.camera.position);
    // this.light.intensity = 1;
    // this.light.lookAt(this.scene.position)
    this.light2 = new HemisphereLight( 0xffffbb, 0x080820, 1 );
    this.scene.add(this.light2)
    // this.light.castShadow = true;

    this.light = new SpotLight('yellow' );
    this.light.position.set(0, 1000, 100);
    // this.light.position.set(this.camera.position);
    // this.light.lookAt(this.scene.position);
    this.light.castShadow = true;

    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;

    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 170;


    this.scene.add(this.light)

    this.controls = new OrbitControls(this.camera)

    this.createFloor();
  }

  // method to control what happens on each render update for the animation
  animateUpdateFn() {
    this.addGeneration(); // atempt to add a generation if the view is full already
    if (this.meshes.length > 50) { // mesh + camera
      this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
      // this.meshes.forEach(m => m.translateY(-this.cellShape.y))
      this.scene.translateY(-this.cellShape.y)
      this.floor.position.y += this.cellShape.y;
    }


    // this.camera.position.y += this.cellShape.y;
    // this.camera.setViewOffset(0,0,0, this.camera.view.y + this.cellShape.y)
    // const scenePosition = this.scene.position
    // scenePosition.y += this.cellShape.y;
    // scenePosition.z = 0;
    // this.controls.pan(0, this.cellShape.y)
    // this.light.position.y += this.cellShape.y;
    // this.light.updateProjectionMatrix();
    // this.camera.lookAt(scenePosition)
    // this.camera.lookAt(this.scene.position);
    // this.camera.lookAt(this.scene.chilren.slice(-1)[0].position);
    // this.updateCamera();

    // this.light.position.y += this.cellShape.y;
    // this.light.position.set(this.camera.position);
    // this.light.lookAt(this.scene.children.slice(-1)[0].position)

  }

  // method to control what happens on each render update regardless if the animation is running
  renderUpdateFn() {
    this.controls.update()
    // console.log('scene position', this.scene.position)
    // console.log("\ncamera position", this.camera.position, "\nlooking at", this.camera.getWorldDirection(this.scene.position), "\nzoom: ", this.camera.zoom, "\nfov", this.camera.fov, "\nmatrix", this.camera.matrix)
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

  customObjectsCleanup() {
    this.cleanUpRefsByMesh(this.floor)
  }

  /*******************************/
  /* CUSTOM METHODS */
  /*******************************/

  createPoint = ({ startX, startY, startZ, geometry, material, singleGeometry }) => {
    const cube = new Mesh(geometry, material);
    // cube.castShadow = true; //default is false
    cube.receiveShadow = true; //default
    cube.position.set(startX, 0, startY);

    cube.updateMatrix();
    singleGeometry.merge(cube.geometry, cube.matrix);
  }

  createFloor = () => {
    const floorMaterial = new MeshBasicMaterial( { color: 'gray', side: THREE.DoubleSide } );
    const floorGeometry = new PlaneGeometry(3000, 3000, 1, 1);
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.castShadow = true; //default is false
    // this.floor.receiveShadow = true; //default
  	this.floor.position.y = -0.5;
  	this.floor.rotation.x = Math.PI / 2;
  	this.scene.add(this.floor);
  };

}
