import {
  Geometry, BoxGeometry, PlaneGeometry, Face3,
  Vector3,
  Mesh, Line,
  MeshLambertMaterial, MeshPhongMaterial, MeshBasicMaterial,
  PointLight, HemisphereLight, SpotLight,
  PerspectiveCamera, OrthographicCamera,
  Color,
} from 'three';
import * as THREE from 'three';
import BaseClass from './base';
import Orbit from 'three-orbit-controls';

const OrbitControls = Orbit(THREE);


function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}

export default class ThreeDimensionViewerInThreeDimensions extends BaseClass {
  constructor({ containerElId, populationShape, retrieveNextGeneration }) {
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }

    super({ containerElId, populationShape, type: 'three-dimension-in-three-dimensions', retrieveNextGeneration })

    this.currentGenerationCount = 0;
    this.populationShape = populationShape;
    this.updateRateInMS = 5000;
    this.generationsToShow = 1;
  }


  /*******************************/
  /* SPECIAL OVERRIDES OF PARENT CLASS */
  /*******************************/
  initCamera() {
    this.camera = new OrthographicCamera( this.containerWidth / - 2, this.containerWidth / 2, this.containerHeight / 2, this.containerHeight / - 2, 1, 10000 );
    this.camera.position.set(-350, 800, 685);
    this.camera.lookAt(new Vector3(1, 0.50, -0.73))
    this.camera.zoom = 0.5;
    this.updateCamera();
  }

  updateScene() {
    this.scene.translateY(-200);
    // this.scene.position.z = -600;
  }

  /*******************************/
  /* REQUIRED BY PARENT CLASS */
  /*******************************/

  handleWindowResize() {
    // this.updateCellShape();
  }

  // method to control how a generation is added to a scene
  addGeneration() {
    const diameter = this.cellShape.x
    const material = new MeshLambertMaterial( {color: new Color(this.hslStringStates[1]) });
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
    const zOffset = this.containerWidth / 2;


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

      column.forEach((row, rowNumber) => {
        const startY = (this.cellShape.y * rowNumber) - yOffset;

        row.forEach((cellState, cellNumber) => {
          if (cellState === 1) {
          const startZ = (this.cellShape.z * cellNumber) - zOffset;
            this.createCube({ startX, startY, startZ, geometry, material, group });
          }
        });
      });
    });

    // group.position.y = startZ;
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
    this.controls = new OrbitControls(this.camera)

    this.createLight();
    // this.createFloor();
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
    // this.light.translateY(this.cellShape.y);
    // this.backLight.translateY(this.cellShape.y);
    // this.scene.translateY(-this.cellShape.y)
    if (this.meshes.length >= this.generationsToShow) { // mesh + camera
      // this.floor.position.setY(this.floor.position.y + this.cellShape.y);
      this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
      // this.camera.translateY(this.cellShape.y)
    }
    this.addGeneration(); // atempt to add a generation if the view is full already

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
    this.scene.remove(this.ambientLight)
    this.dispose(this.ambientLight)

    this.cleanUpRefsByMesh(this.floor)
  }

  /*******************************/
  /* CUSTOM METHODS */
  /*******************************/

  createLight = () => {
    this.ambientLight = new THREE.AmbientLight( 0xE5E5E5 ); // soft white light 0x404040
    this.scene.add( this.ambientLight );

    this.light = new SpotLight(0xffffff);
    this.light.angle = 200;
    this.light.position.set(45, this.cellShape.y * this.generationsToShow + 200, 600);
    this.light.castShadow = true;

    this.light.intensity = 0.8
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 170;

    this.scene.add(this.light)
  }

  createCube = ({ startX, startY, startZ, geometry, material, group }) => {
    const cube = new Mesh(geometry, material);

    cube.castShadow = true; //default is false
    cube.receiveShadow = true; //default
    cube.position.set(startX, startZ, startY);

    group.add(cube)
  }

  createFloor = () => {
    const floorMaterial = new MeshLambertMaterial( { color: new Color(this.hslStringStates[0]), side: THREE.DoubleSide } );
    const floorGeometry = new PlaneGeometry(30000, 30000, 1, 1);
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);

    this.floor.receiveShadow = true; //default
  	this.floor.position.y = -100;
  	this.floor.rotation.x = Math.PI / 2;
  	this.scene.add(this.floor);
    // console.log(this.floor)
  };

}
