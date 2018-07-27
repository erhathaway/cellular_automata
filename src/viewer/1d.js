import {
  Scene, WebGLRenderer, PerspectiveCamera, PointLight,
  PointsMaterial, Geometry,
  Vector3,
  Points,
  MeshBasicMaterial, SphereGeometry, Mesh, MeshLambertMaterial
} from 'three';

import render from './render';

export default class OneDimensionViewer {
  constructor(containerElId, getNextGeneration) {
    this.dimension = '1D';

    this.containerElId = containerElId
    this._getNextGeneration = getNextGeneration;

    this.updateCellDimensions();

    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.elID = this.dimension + '-dimension-viewer';
    this.renderer.domElement.id = this.elID

    const CONTAINER_WIDTH =  this.containerWidth;
    const CONTAINER_HEIGHT = this.containerHeight;
    const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    const VIEW_ANGLE = 91;
    const NEAR = 0.1;
    const FAR = 500;
    this.camera = new PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR );
    this.light = new PointLight('yellow');

    this.renderer.shadowMap.enabled = true;
    this.light.castShadow = true;
  	this.scene.add(this.camera);
  	this.camera.position.set(0, 0, 360);
  	this.camera.lookAt(this.scene.position);
    this.setRendererSize();

    this.currentGenerationCount = 0;
    this.currrentGenerationYPosition = (this.containerHeight / 2) * -1;
    this.moveSceneDistance = 0;

    this.animationStepsPerUpdate = 2;
    this.totalDistanceToMovePerAnimation = undefined;
    this.distanceToMoveOnAnimation = undefined;
    this.cellDiameter = undefined;
    this.runSimulation = true;
    window.addEventListener('resize', this.handleWindowResize);

    this.materials = [];
    this.geometries = [];
    this.meshes = [];
    this.vectors = [];
  }

  setRendererSize = () => {
    this.renderer.setSize(this.containerWidth, this.containerHeight);
  }

  turnSimulationOff = () => this.runSimulation = false;
  turnSimulationOn = () => this.runSimulation = true;

  updateCellDimensions = () => {
    this.cellDiameter = +(this.containerWidth / this.populationCount).toFixed(2);
    this.distanceToMoveOnAnimation = this.cellDiameter / this.animationStepsPerUpdate;
    this.resetTotalDistanceToMovePerAnimation();
  }

  get containerWidth() {
    return this.containerEl.clientWidth;
  }

  get containerHeight() {
    return this.containerEl.clientHeight;
  }

  get maxGenerationsToShow() {
    return Math.ceil(this.containerHeight / this.cellDiameter) + 2;
  }

  get containerEl() {
     return document.getElementById(this.containerElId);
  }

  resetTotalDistanceToMovePerAnimation = () => {
    this.totalDistanceToMovePerAnimation = this.cellDiameter;
  }

  setPopulationCount = (populationCount) => {
    this.populationCount = populationCount;
    this.updateCellDimensions();
  }

  handleWindowResize = () => {
    this.updateCellDimensions();
    this.setRendererSize();
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
  }

  setCameraProjectionMatrix = (camera) => {

  }

  setCameraPosition = (camera) => {

  }

  setScenePosition = (camera) => {

  }

  initLight = () => {
    this.light.position.set( 0, 0, 1 );
    this.scene.add(this.light);
  }

  setLightProperties = () => {

  }

  clearScene = () => {
    this.currentGenerationCount = 0;
    while (this.scene.children.length > 0) {
      this.scene.remove.apply(this.scene, this.scene.children);
    };
  }

  createPoint = ({ startX, startY, geometry }) => {
    const vertex = new Vector3();
    vertex.x = startX;
    vertex.y = startY;
    vertex.z = 0;

    geometry.vertices.push(vertex);
  }

  addGeneration = () => {
    const material = new PointsMaterial( { color: 'white', size: this.cellDiameter || 0, sizeAttenuation: true } );
    this.materials.push(material);
    const geometry = new Geometry();
    this.geometries.push(geometry);

    const generationState = this._getNextGeneration();

    this.setPopulationCount(generationState.length)
    const startY = this.currrentGenerationYPosition;
    const xOffset = this.containerWidth / 2;

    generationState.forEach((cellState, cellNumber) => {
      if (cellState === 1) {
        const startX = (this.cellDiameter * cellNumber) - xOffset;

        this.createPoint({ startX, startY, geometry });
      }
    });

    // geometry.verticesNeedUpdate = true
    const pointField = new Points(geometry, material);
    this.meshes.push(pointField);
    this.scene.add(pointField);

    this.currrentGenerationYPosition += this.cellDiameter;
    this.currentGenerationCount += 1;
  }

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

  removeGeneration = () => {
    if (this.scene.children[0] && this.scene.children.length > this.maxGenerationsToShow) {
      this.scene.remove(this.camera)

      const mesh = this.meshes.shift();
      this.cleanUpRefsByMesh(mesh);
    }
  }

  updateFn = () => {
    if (this.runSimulation === true) {
      this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
      if (this.totalDistanceToMovePerAnimation <= 0) { // if there is nothing left to move, add a generation;
        this.resetTotalDistanceToMovePerAnimation();
        this.addGeneration();
        // this.removeGeneration();
      } else {
        this.scene.translateY(-this.distanceToMoveOnAnimation);
        this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
      }
    } else {
      if (this.totalDistanceToMovePerAnimation > this.distanceToMoveOnAnimation) {
        this.scene.translateY(-this.distanceToMoveOnAnimation);
        this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
      }
    }
  }

  createScene = () => {
    // while (this.scene.children.length > 0) {
      // this.scene.remove.apply(this.scene, this.scene.children);
    // };

    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(this.renderer.domElement);

    // setCameraProjectionMatrix(camera);
    // setCameraPosition(camera);
    // setScenePosition(camera);
    //
    // createSky();
    // createGenerations(0);
    // createFloor();
    // createLight();

    this.containerEl.appendChild( this.renderer.domElement );

    this.cancelRender = render({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
      updateFn: this.updateFn,
    })
  };

  quit = () => {
    this.cancelRender();
    this.meshes.forEach(m => this.cleanUpRefsByMesh(m, true))
    this.dispose(this.camera)
    this.dispose(this.light)
    this.dispose(this.scene)
    this.dispose(this.renderer)

    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;


    setTimeout(function() {
      document.getElementById(this.elID).remove();
    }.bind(this), 1000)

    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.light = null;
  }

  cleanUp = () => {
    this.renderer.forceContextLoss();
  }
}
