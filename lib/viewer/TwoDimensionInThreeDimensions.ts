import {
  Vector3,
  Mesh,
  MeshLambertMaterial,
  SpotLight,
  AmbientLight,
  OrthographicCamera,
  Color,
  BoxGeometry,
  PlaneGeometry,
  Group,
  DoubleSide,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';

export default class TwoDimensionViewerInThreeDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;
  generationsToShow = 60;
  controls?: OrbitControls;
  ambientLight?: AmbientLight;
  floor?: Mesh;

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'two-dimension-in-three-dimensions' });

    this.populationShape = opts.populationShape;
    this.updateRateInMS = 16;
  }

  initCamera() {
    this.camera = new OrthographicCamera(
      this.containerWidth / -2,
      this.containerWidth / 2,
      this.containerHeight / 2,
      this.containerHeight / -2,
      1,
      10000
    );
    this.camera.position.set(-350, 800, 685);
    this.camera.lookAt(new Vector3(1, 0.5, -0.73));
    (this.camera as OrthographicCamera).zoom = 1;
    this.updateCamera();
  }

  updateScene() {
    this.scene.translateY(-200);
  }

  handleWindowResize() {}

  addGeneration() {
    const diameter = this.cellShape.x;
    const material = new MeshLambertMaterial({
      color: new Color(this.hslStringStates[1]),
    });
    const geometry = new BoxGeometry(diameter, diameter, diameter);
    const group = new Group();

    this.materials.push(material);
    this.geometries.push(geometry);

    const generationState = this.retrieveNextGeneration() as number[][];

    if (this._populationShape.x !== generationState.length) {
      this.populationShape = { x: generationState.length };
    }

    const xOffset = this.containerWidth / 2;
    const yOffset = this.containerHeight / 2;

    const startZ = this.currentGenerationCount * this.cellShape.z;

    generationState.forEach((column: number[], columnNumber: number) => {
      const startX = this.cellShape.x * columnNumber - xOffset;
      column.forEach((cellState: number, cellNumber: number) => {
        if (cellState === 1) {
          const startY = this.cellShape.y * cellNumber - yOffset;
          const cube = new Mesh(geometry, material);
          cube.castShadow = true;
          cube.receiveShadow = true;
          cube.position.set(startX, 0, startY);
          group.add(cube);
        }
      });
    });

    group.position.y = startZ;
    this.scene.add(group);
    this.meshes.push(group);
    this.currentGenerationCount += 1;
  }

  removeGeneration() {
    const mesh = this.meshes[0];
    this.cleanUpRefsByMesh(mesh, true);
  }

  initialize() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.createLight();
  }

  animateUpdateFn() {
    this.addGeneration();
    this.light.translateY(this.cellShape.y);
    this.scene.translateY(-this.cellShape.y);
    if (this.meshes.length > this.generationsToShow) {
      if (this.floor) {
        this.floor.position.setY(this.floor.position.y + this.cellShape.y);
      }
      this.removeGeneration();
    }
    this.updateCamera();
  }

  renderUpdateFn() {}

  updateCellShape(cellShape?: any) {
    if (cellShape) {
      this.cellShape = cellShape;
    } else {
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter, z: diameter };
    }
  }

  set populationShape(populationShape: any) {
    this._populationShape = populationShape;
    this.updateCellShape();
  }

  customObjectsCleanup() {
    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
      this.dispose(this.ambientLight);
    }
    this.cleanUpRefsByMesh(this.floor);
  }

  createLight() {
    this.ambientLight = new AmbientLight(0xe5e5e5);
    this.scene.add(this.ambientLight);

    this.light = new SpotLight(0xffffff);
    this.light.angle = 200;
    this.light.position.set(45, this.cellShape.y * this.generationsToShow + 200, 600);
    this.light.castShadow = true;
    this.light.intensity = 0.4;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 500;
    this.light.shadow.camera.far = 4000;
    this.light.shadow.camera.fov = 170;

    this.scene.add(this.light);
  }

  createFloor() {
    const floorMaterial = new MeshLambertMaterial({
      color: new Color(this.hslStringStates[0]),
      side: DoubleSide,
    });
    const floorGeometry = new PlaneGeometry(30000, 30000, 1, 1);
    this.floor = new Mesh(floorGeometry, floorMaterial);
    this.floor.receiveShadow = true;
    this.floor.position.y = -100;
    this.floor.rotation.x = Math.PI / 2;
    this.scene.add(this.floor);
  }
}
