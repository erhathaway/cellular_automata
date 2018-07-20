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
    this.containerElId = containerElId
    this._getNextGeneration = getNextGeneration;

    this.updateCellDimensions();

    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });

    const CONTAINER_WIDTH =  this.containerWidth;
    const CONTAINER_HEIGHT = this.containerHeight;
    const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    const VIEW_ANGLE = 91;
    const NEAR = 0.1;
    const FAR = 20000;
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

    this.animationStepsPerUpdate = 5;
    this.totalDistanceToMovePerAnimation = undefined;
    this.distanceToMoveOnAnimation = undefined;
    this.cellDiameter = undefined;
    this.runSimulation = true;
    window.addEventListener('resize', this.handleWindowResize);
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
    const geometry = new Geometry();

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

    geometry.verticesNeedUpdate = true
    const pointField = new Points(geometry, material);
    this.scene.add(pointField);

    this.currrentGenerationYPosition += this.cellDiameter;
    this.currentGenerationCount += 1;
  }

  removeGeneration = () => {
    // console.log(this.scene.position, -this.containerHeight, this.scene.children.length)
    if (this.scene.children[0] && this.scene.children.length > this.maxGenerationsToShow) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  updateFn = () => {
    if (this.runSimulation === true) {
      this.removeGeneration(); // attempt to trim fat in case there are more than 1 extra generations due to container resizing
      if (this.totalDistanceToMovePerAnimation <= 0) { // if there is nothing left to move, add a generation;
        this.resetTotalDistanceToMovePerAnimation();
        this.addGeneration();
      } else {
        this.scene.translateY(-this.distanceToMoveOnAnimation);
        this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
      }
    } else {
      if (this.resetTotalDistanceToMovePerAnimation > this.distanceToMoveOnAnimation) {
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

    render({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
      updateFn: this.updateFn,
    })
  };

}
