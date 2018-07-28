import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';
import render from './render';

function MethodNotDefined(message) {
  this.message = message;
  this.name = 'MethodNotDefined';
}

function AttributeNotDefined(message) {
  this.message = message;
  this.name = 'AttributeNotDefined';
}

export default class BaseClass {
  constructor({ containerElId, type, populationShape, retrieveNextGeneration }) {
    // INFO, VERBOSE
    this.debug = 'VERBOSE';
    if (this.debug === 'VERBOSE') { console.log(
      "constructor called with args... \n",
      "\ncontainerElId:", containerElId,
      "\ntype:", type,
      "\npopulationShape:", populationShape,
      "\nretrieveNextGeneration:", retrieveNextGeneration,
    )}

    if (containerElId === undefined) { throw new AttributeNotDefined('The DOM ID for the container element must be passed to the constructor') }
    if (type === undefined) { throw new AttributeNotDefined('A type string must be passed to the constructor to specify the type of viewer') }
    if (populationShape === undefined) { throw new AttributeNotDefined('A population shape objects must be passed to the constructor') }
    if (retrieveNextGeneration === undefined) { throw new AttributeNotDefined('A retrieveNextGeneration function must be passed to the constructor') }

    // viewer defaults
    this.runSimulation = false;
    this.cellShape = undefined;
    this.containerElId = containerElId;
    this.type = type;
    this.retrieveNextGeneration = retrieveNextGeneration;

    // threeJS ref holders
    this.materials = [];
    this.geometries = [];
    this.meshes = [];
    this.vectors = [];

    // create scene & renderer
    this.initScene();
    this.initRenderer();
    this.initCamera();

    window.addEventListener('resize', this._handleWindowResize);

    this.updateRateInMS = undefined;
    this.updateStartTime = new Date().getTime();
  }

  /*********************/
  /* SCENE */
  /*********************/
  initScene() {
    this.scene = new Scene();
    this.updateScene();
    if (this.debug) console.log('initialized scene')
  }

  updateScene() {
  }

  /*********************/
  /* RENDERER */
  /*********************/
  initRenderer() {
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;

    // assign render El a DOM id
    this.elID = this.type + '-automata-viewer';
    this.renderer.domElement.id = this.elID

    this.updateRenderer();
    if (this.debug) console.log('initialized renderer')

  }

  updateRenderer = ({ width, height } = {}) => {
    this.renderer.setSize(this.containerWidth, this.containerHeight);
  }

  /*********************/
  /* CAMERA */
  /*********************/
  initCamera() {
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

    if (this.debug) console.log('initialized camera')
  }

  updateCamera() {
    this.camera.updateProjectionMatrix();
  }

  /************************/
  /* Simulation controls */
  /***********************/
  turnSimulationOff() { this.runSimulation = false; }
  turnSimulationOn() { this.runSimulation = true; }

  /************************/
  /* Sizing */
  /***********************/
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
    this.updateCamera();
  }

  /************************/
  /* Subclass methods */
  /***********************/
  // method to control things like updating the cell shape
  handleWindowResize() { throw new MethodNotDefined('handleWindowResize not defined in child class') }

  // method to control how a generation is added to a scene
  addGeneration() { throw new MethodNotDefined('addGeneration not defined in child class') }

  // method to control how a generation is removed from a scene
  removeGeneration() { throw new MethodNotDefined('removeGeneration not defined in child class') }

  // method to initialize lights, sky, background, etc on the initial scene creation
  initialize() { throw new MethodNotDefined('initialize not defined in child class') }

  // method to control what happens on each render update for the animation
  animateUpdateFn() { throw new MethodNotDefined('animateUpdateFn not defined in child class') }


  // method to control what happens on each render update regardless if the animation is running
  renderUpdateFn() { throw new MethodNotDefined('renderUpdateFn not defined in child class') }

  // should set the cellShape attribute '{ x: INT } | { x: INT, y: INT } | { x: INT, y: INT, z: INT}'
  // can be used for things like reconfiguring how many steps to move per animation step and reseting total distance moved per animation to make sure steps are reconfigured when size changes
  updateCellShape() { throw new MethodNotDefined('updateCellShape not defined in child class') }

  // population is used to figure out cell shape usually
  set populationShape(shape) { throw new MethodNotDefined('updateCellShape not defined in child class') }

  // for disposing of custom objects like a floor or sky etc..
  customObjectsCleanup() { throw new MethodNotDefined('customObjectsCleanup not defined in child class') }

  _updateFn = () => {
    this.renderUpdateFn();

    if (this.runSimulation === true) {
      if (this.debug && this.debug === 'VERBOSE') console.log('Run simulation is: TRUE')
      if(this.updateRateInMS) {
        if (this.debug && this.debug === 'VERBOSE') console.log(`An update rate of ${this.updateRateInMS} was detected`)
        const currentTime = new Date().getTime();
        if (currentTime - this.updateStartTime >= this.updateRateInMS) {
          this.updateStartTime = currentTime;
          this.animateUpdateFn();
        }
      } else {
        this.animateUpdateFn();
      }
    } else {
      if (this.debug && this.debug === 'VERBOSE') console.log('Run simulation is: FALSE')
    }
  }

  /************************/
  /* Rendering */
  /***********************/

  createScene = () => {
    this.initialize();
    this.containerEl.appendChild( this.renderer.domElement );

    if (this.debug === 'VERBOSE') {
      console.log(
        'attempting scene rendering with main objects...',
        "\n renderer:", this.renderer,
        "\n scene:", this.scene,
        "\n camera:", this.camera,
        "\n updateFn:", this.updateFn,
        "\n light:", this.light,
      )
    }

    this.cancelRender = render({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
      updateFn: this._updateFn,
    });
    if (this.debug) console.log('initial scene rendered')
  }


  /************************/
  /* Cleanup */
  /***********************/
  dispose = (obj) => {
    if (obj === undefined) return;
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
    if (this.debug) console.log('running quit viewer code')

    this.cancelRender();
    this.meshes.forEach(m => this.cleanUpRefsByMesh(m, true));
    this.customObjectsCleanup();
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

    if (this.debug) console.log('successfully quit')
  }
}
