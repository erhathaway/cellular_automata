import {
  Scene, WebGLRenderer, PerspectiveCamera, PointLight,
  PointsMaterial, Geometry,
  Vector3,
  Points,
  MeshBasicMaterial, SphereGeometry, Mesh, MeshLambertMaterial
} from 'three';

import render from './render';

export default class OneDimensionViewer {
  constructor(containerElId, generationGenerator) {
    this.containerElId = containerElId
    this._generationGenerator = generationGenerator;
    // this.setPopulationCount(500);

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

  get maxGenerations() {
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
    // console.log('updating population count', this.populationCount)
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

    const generationState = this._generationGenerator();

    this.setPopulationCount(generationState.length)
    // const startY = (this.currentGenerationCount * this.cellDiameter) - yOffset;
    const startY = this.currrentGenerationYPosition;
    this.currrentGenerationYPosition += this.cellDiameter;
    // let startX = -this.containerWidth / 2;
    const xOffset = this.containerWidth / 2;
    // const xOffset = 500;
    console.log('xoffset', xOffset)

    generationState.forEach((cellState, cellNumber) => {
      if (cellState === 1) {
        const startX = (this.cellDiameter * cellNumber) - xOffset;

        // const yOffset = (this.containerHeight / 2) + (this.cellDiameter * 2);
        this.createPoint({ startX, startY, geometry });
      }
      // startX = startX + this.cellDiameter
    });

    geometry.verticesNeedUpdate = true
    const pointField = new Points(geometry, material);
    this.scene.add(pointField);

    this.currentGenerationCount += 1;
  }

  removeGeneration = () => {
    this.scene.remove(this.scene.children[0]);
  }

  updateFn = () => {
    if (this.runSimulation === true) {
      const maxGenerations = this.maxGenerations

      this.scene.translateY(-this.distanceToMoveOnAnimation)

      this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
      if (this.totalDistanceToMovePerAnimation < this.distanceToMoveOnAnimation) {
        this.resetTotalDistanceToMovePerAnimation();

        this.addGeneration();
        if (this.scene.children[0] && this.scene.children.length >= maxGenerations) {
          this.removeGeneration();
        }
      }
    } else {
      if (this.resetTotalDistanceToMovePerAnimation > this.distanceToMoveOnAnimation) {
        this.scene.translateY(-this.distanceToMoveOnAnimation)
        this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
      }
    }

    // this.camera.updateProjectionMatrix()
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
