import {
  Scene, WebGLRenderer, PerspectiveCamera, PointLight,
  PointsMaterial, Geometry,
  Vector3,
  Points,
  MeshBasicMaterial, SphereGeometry, Mesh, MeshLambertMaterial
} from 'three';

import render from './render';

export default class OneDimensionViewer {
  constructor(containerElId) {
    this.setContainerById(containerElId);
    this.setPopulationCount(500);

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
    this.renderer.setSize(CONTAINER_WIDTH, CONTAINER_HEIGHT);

    this.currentGeneration = 0;
  }

  createPoint = ({ startX, startY, geometry }) => {
    const vertex = new Vector3();
    vertex.x = startX;
    vertex.y = startY;
    vertex.z = 0;

    geometry.vertices.push(vertex);
  }

  updateCellDimensions = () => {
    this.cellDiameter = +(this.containerWidth / this.populationCount).toFixed(2);
  }

  setPopulationCount = (populationCount) => {
    this.populationCount = populationCount;
    this.updateCellDimensions();
  }

  setContainerById = (containerElId) => {
    this.containerEl = document.getElementById(containerElId);
    this.containerHeight = this.containerEl.clientHeight;
    this.containerWidth = this.containerEl.clientWidth;
    console.log(this.containerWidth)
    this.updateCellDimensions();
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
    this.currentGeneration = 0;
    while (this.scene.children.length > 0) {
      this.scene.remove.apply(this.scene, this.scene.children);
    };
  }

  addGeneration = ({ generationState }) => {
    const material = new PointsMaterial( { color: 'black', size: this.cellDiameter, sizeAttenuation: true } );
    const geometry = new Geometry();

    this.setPopulationCount(generationState.length)
    generationState.forEach((state, cellNumber) => {
      if (state === 1) {
        const xOffset = this.containerWidth / 2;
        const startX = (this.cellDiameter * cellNumber) - xOffset;

        const yOffset = (this.containerHeight / 2);
        const startY = (this.currentGeneration * this.cellDiameter) - yOffset;
        this.createPoint({ startX, startY, geometry });
      }
    });

    geometry.verticesNeedUpdate = true
    const pointField = new Points(geometry, material);
    this.scene.add(pointField);

    this.currentGeneration += 1;

    const maxGenerations = this.containerHeight / this.cellDiameter;
    if (this.scene.children[0] && this.scene.children.length > maxGenerations) {
      this.scene.remove(this.scene.children[0])
      this.scene.position.y -= this.cellDiameter;
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
    })
  };

}
