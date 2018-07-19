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
    this.moveSceneDistance = 0;
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
    const material = new PointsMaterial( { color: 'white', size: this.cellDiameter, sizeAttenuation: true } );
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
    if (this.scene.children[0] && this.scene.children.length > maxGenerations + 2) {
      // if (this.scene.children[0].position.y < this.containerHeight / 2) {
        this.scene.remove(this.scene.children[0]);
      // }
      this.moveSceneDistance += this.cellDiameter;
      // this.scene.position.y -= this.cellDiameter;
    }
  }


  updateFn = () => {
    // this.scene.position.y -= this.cellDiameter;
    // this.scene.children.forEach((ch) => console.log(ch))
    // const bs = this.scene.children[1].geometry.boundingSphere;
    // const bottom = this.containerHeight / 2 * - 1 + 1;
    // if (bs && bs.center) {
    //   if (bs.center.y < (bottom - 10) || bs.center.y > (bottom + 10)) {
    //     this.scene.remove(this.scene.children[1]);
    //   }
    //   console.log('cell bottom', bs.center.y)
    // }

    // console.log('container bottom', bottom)
    // if (this.scene.children[0].position.y < (this.containerHeight / 2 * -1)) {
      // const height = this.scene.children[0].position.y
      // console.log('height', height)
      // this.scene.remove(this.scene.children[0]);
    // }

    if (this.moveSceneDistance >= 0.001) {
      let move = this.moveSceneDistance / 10;
      // if (this.moveTotal === undefined) { this.moveTotal = 0}
      // if (this.moveCount === undefined) { this.moveCount = 0}
      // this.moveTotal += move;
      // this.moveCount += 1;
      // this.moveAvg = this.moveTotal / this.moveCount;
      // console.log('move avg', this.moveAvg, 'move', move)
      // if (this.moveAvg / move < 1.1 && this.moveAvg / move > .9) {
        // move = this.moveAvg;
      // }
      this.scene.position.y -= move;
      this.moveSceneDistance -= move;
      // console.log('move', move)
      // console.log('dist left', this.moveSceneDistance)
      // requestAnimationFrame(animate);
    } else {
      this.moveSceneDistance = 0;
      // this.scene.remove(this.scene.children[0])

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
