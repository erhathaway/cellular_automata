import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';
import render from './render';

export default class BaseClass {
  static MethodNotDefined(message) {
   this.message = message;
   this.name = 'MethodNotDefined';
  }

  static AttributeNotDefined(message) {
    this.message = message;
    this.name = 'AttributeNotDefined'
  }

  constructor({ containerElId, type }) {
    if (containerElId === undefined) throw BaseClass.AttributeNotDefined('The DOM ID for the container element must be passed to the constructor')
    if (type === undefined) throw BaseClass.AttributeNotDefined('A type string must be passed to the constructor to specify the type of viewer')

    // viewer defaults
    this.runSimulation = true;
    this.cellShape = undefined;
    this.type = type;
    this.containerElId = containerElId;

    // threeJS ref holders
    this.materials = [];
    this.geometries = [];
    this.meshes = [];
    this.vectors = [];


    // create scene & renderer
    this.initScene();
    this.initRenderer();
    this.initCamera();

    this.updateCellShape();

    window.addEventListener('resize', this._handleWindowResize);
  }

  /*********************/
  /* SCENE */
  /*********************/
  initScene = () => {
    this.scene = new Scene();
    this.updateScene();
  }

  updateScene = () => {

  }

  /*********************/
  /* RENDERER */
  /*********************/
  initRenderer = () => {
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;

    // assign render El a DOM id
    this.elID = this.type + 'automata-viewer';
    this.renderer.domElement.id = this.elID

    this.updateRenderer();
  }

  updateRenderer = ({ width, height }) => {
    this.renderer.setSize(width || this.containerWidth, height || this.containerHeight);
  }

  /*********************/
  /* CAMERA */
  /*********************/
  initCamera = () => {
    const CONTAINER_WIDTH =  this.containerWidth;
    const CONTAINER_HEIGHT = this.containerHeight;
    const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    const VIEW_ANGLE = 91;
    const NEAR = 0.1;
    const FAR = 500;
    this.camera = new PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR );

    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 360);
    this.camera.lookAt(this.scene.position);
    this.updateCamera();
  }

  updateCamera = () => {

  }

  /************************/
  /* Simulation controls */
  /***********************/
  turnSimulationOff = () => this.runSimulation = false;
  turnSimulationOn = () => this.runSimulation = true;

  /************************/
  /* Sizing */
  /***********************/
  // updateCellShape = () => {
  //   this.cellDiameter = +(this.containerWidth / this.populationCount).toFixed(2);
  //   this.updateCellShapeCallback();
  // }

  get containerWidth() {
    return this.containerEl.clientWidth;
  }

  get containerHeight() {
    return this.containerEl.clientHeight;
  }

  get containerEl() {
     return document.getElementById(this.containerElId);
  }

  _handleWindowResize = () => {
    this.handleWindowResize();
    this.updateRenderer();
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
  }

  /************************/
  /* Subclass methods */
  /***********************/
  // method to control things like updating the cell shape
  handleWindowResize = () => throw BaseClass.MethodNotDefined('handleWindowResize not defined in child class')

  // method to control how a generation is added to a scene
  addGeneration = () => throw BaseClass.MethodNotDefined('addGeneration not defined in child class')

  // method to control how a generation is removed from a scene
  removeGeneration = () => throw BaseClass.MethodNotDefined('removeGeneration not defined in child class')

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize = () => throw MethodNotDefined('initialize not defined in child class')

  // method to control what happens on each render update
  updateFn = () => throw MethodNotDefined('updateFn not defined in child class')

  // should set the cellShape attribute '{ x: INT } | { x: INT, y: INT } | { x: INT, y: INT, z: INT}'
  // can be used for things like reconfiguring how many steps to move per animation step and reseting total distance moved per animation to make sure steps are reconfigured when size changes
  updateCellShape = () => throw MethodNotDefined('updateCellShape not defined in child class')

  _updateFn = () => {
    if (this.runSimulation === true) {
      this.updateFn();
    }
  }

  /************************/
  /* Rendering */
  /***********************/

  createScene = () => {
    this.initialize();
    this.containerEl.appendChild( this.renderer.domElement );
    this.cancelRender = render({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
      updateFn: this._updateFn,
    });
  }


  /************************/
  /* Cleanup */
  /***********************/
  dispose = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key].dispose === 'function') {
        try {
          this.dispose(obj[key])
        } catch(e) {}
      }
      if (typeof obj.dispose === 'function') {
        try {
          obj.dispose();
        } catch(e) {}
      }

      if (key !== 'forceContextLoss') {
        try {
          obj[key] = null;
        } catch(e) {}
      }
    });
  }

  cleanUpRefsByMesh = (mesh, deleteMesh) => {
    if (deleteMesh) {
      this.meshes = this.meshes.filter(obj => obj.uuid !== mesh.uuid);
    }

    const geometry = mesh.geometry;
    this.geometries = this.geometries.filter(obj => obj.uuid !== geometry.uuid);


    const material = mesh.material;
    this.materials = this.materials.filter(obj => obj.uuid !== material.uuid);


    this.scene.remove(mesh);
    this.dispose(geometry);
    this.dispose(material);
    this.dispose(mesh);
  }

  quit = () => {
    this.cancelRender();
    this.meshes.forEach(m => this.cleanUpRefsByMesh(m, true));
    this.dispose(this.camera);
    this.dispose(this.light);
    this.dispose(this.scene);
    this.dispose(this.renderer);

    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;

    setTimeout(function() {
      document.getElementById(this.elID).remove();
    }.bind(this), 1000);

    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.light = null;
  }
}
