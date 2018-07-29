import {
  Geometry, BoxGeometry, PlaneGeometry, Face3,
  Vector3,
  Mesh, Line,
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
    this.camera.position.set(0, 85, 585);
    // this.camera.position = new Vector3(736.8930611289219, 393.216440052488, 536.7644484682672)
    this.camera.lookAt(new Vector3(1, 0.50, -0.73))
    this.camera.zoom = 1;
    this.updateCamera();
    // this.scene.add(this.camera)
  }

  updateScene() {
    this.scene.translateY(-200);
    // this.scene.position.z = -600;
  }

  /*******************************/
  /* REQUIRED BY PARENT CLASS */
  /*******************************/

  handleWindowResize() {
    this.updateCellShape();
  }

  // method to control how a generation is added to a scene
  addGeneration() {
    const diameter = this.cellShape.x
    const material = new MeshLambertMaterial( {color: 0x8888ff} );
    const geometry = new THREE.BoxBufferGeometry( diameter, diameter, diameter );
    const group = new THREE.Group();


    this.materials.push(this.material);
    this.geometries.push(this.geometry);

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

          this.createCube({ startX, startY, startZ, geometry, material, group });
        }
      })
    });

    group.position.y = startZ;
    this.scene.add(group)
    this.meshes.push(group)
    this.currentGenerationCount += 1;
  }

  // method to control how a generation is removed from a scene
  removeGeneration() {
    const mesh = this.meshes[0];
    this.cleanUpRefsByMesh(mesh, true)
  }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() {
    this.light = new SpotLight('white');
    this.light.position.set(45, 1000, 600);
    this.light.castShadow = true;

    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 170;


    this.scene.add(this.light)

    this.controls = new OrbitControls(this.camera)
    // console.log(this.camera)
    // console.log(this.controls)
    this.createFloor();
  }

  // method to control what happens on each render update for the animation
  animateUpdateFn() {
    // const numberOfCellsPerHeight =  this.containerHeight / this.cellShape.y;
    // const heightMeshes = this.meshes.slice(-numberOfCellsPerHeight)
    // const middleIndex = Math.ceil(heightMeshes.length / 2);
    // const middleMesh = heightMeshes[middleIndex]
    const lastMesh = this.meshes.slice(-1)[0]
    if (lastMesh) {
      // console.log(middleMesh.position.y)
      // this.controls.target.y = middleMesh.position.y

      // if (this.controls.target.x < 200) {
      //   this.controls.target.x += 1
      // } {
      //   // this.controls.target.z += 10
      // }
      // this.camera.lookAt(lastMesh)
    }
    this.addGeneration(); // atempt to add a generation if the view is full already
    this.light.translateY(this.cellShape.y);
    this.scene.translateY(-this.cellShape.y)
    this.floor.translateY(this.cellShape.y);
    if (this.meshes.length > 100) { // mesh + camera
      this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
      // this.camera.translateY(this.cellShape.y)
    }
    this.updateCamera();
  }

  // method to control what happens on each render update regardless if the animation is running
  renderUpdateFn() {
    // this.controls.update()
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

  createCube = ({ startX, startY, startZ, geometry, material, group }) => {
    const cube = new Mesh(geometry, material);

    cube.castShadow = true; //default is false
    cube.receiveShadow = true; //default
    cube.position.set(startX, 0, startY);

    group.add(cube)
  }

  createFloor = () => {
    const floorMaterial = new MeshLambertMaterial( { color: 'yellow', side: THREE.DoubleSide } );
    const floorGeometry = new PlaneGeometry(3000, 3000, 1, 1);
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.castShadow = true; //default is false
    this.floor.receiveShadow = true; //default
  	this.floor.position.y = -100;
  	this.floor.rotation.x = Math.PI / 2;
  	this.scene.add(this.floor);
  };

}
