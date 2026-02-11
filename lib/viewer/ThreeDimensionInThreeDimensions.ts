import {
  Vector3,
  Mesh,
  MeshLambertMaterial,
  DirectionalLight,
  AmbientLight,
  OrthographicCamera,
  Color,
  BoxGeometry,
  Group,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';

export default class ThreeDimensionViewerInThreeDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;
  generationsToShow = 1;
  controls?: OrbitControls;
  ambientLight?: AmbientLight;
  directionalLight?: DirectionalLight;

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'three-dimension-in-three-dimensions' });

    this.populationShape = opts.populationShape;
    this.updateRateInMS = 200;
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
    (this.camera as OrthographicCamera).zoom = 0.6;
    this.updateCamera();
  }

  updateScene() {}

  handleWindowResize() {}

  addGeneration() {
    const diameter = this.cellShape.x;
    const geometry = new BoxGeometry(diameter, diameter, diameter);
    const group = new Group();

    this.geometries.push(geometry);

    const generationState = this.retrieveNextGeneration() as number[][][];

    const shapeX = this._populationShape.x || generationState.length;
    const shapeY = this._populationShape.y || shapeX;
    const shapeZ = this._populationShape.z || shapeX;

    const xOffset = (shapeX * diameter) / 2;
    const yOffset = (shapeY * diameter) / 2;
    const zOffset = (shapeZ * diameter) / 2;

    generationState.forEach((column: number[][], columnNumber: number) => {
      const nx = shapeX > 1 ? columnNumber / (shapeX - 1) : 0.5;
      const startX = diameter * columnNumber - xOffset;
      column.forEach((row: number[], rowNumber: number) => {
        const ny = shapeY > 1 ? rowNumber / (shapeY - 1) : 0.5;
        const startY = diameter * rowNumber - yOffset;
        row.forEach((cellState: number, cellNumber: number) => {
          if (cellState === 1) {
            const nz = shapeZ > 1 ? cellNumber / (shapeZ - 1) : 0.5;
            const startZ = diameter * cellNumber - zOffset;

            // Map position to color: x → hue, y → saturation, z → lightness
            const hue = Math.floor(nx * 300);
            const sat = Math.floor(60 + ny * 40);
            const lit = Math.floor(35 + nz * 40);
            const mat = new MeshLambertMaterial({
              color: new Color(`hsl(${hue}, ${sat}%, ${lit}%)`),
              transparent: true,
              opacity: 0.9,
            });
            this.materials.push(mat);

            const cube = new Mesh(geometry, mat);
            cube.position.set(startX, startZ, startY);
            group.add(cube);
          }
        });
      });
    });

    this.scene.add(group);
    this.meshes.push(group);
    this.currentGenerationCount += 1;
  }

  removeGeneration() {
    const mesh = this.meshes[0];
    this.cleanUpRefsByMesh(mesh, true);
  }

  clearGenerations() {
    super.clearGenerations();
    this.currentGenerationCount = 0;
  }

  initialize() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.createLight();
  }

  animateUpdateFn() {
    if (this.meshes.length >= this.generationsToShow) {
      this.removeGeneration();
    }
    this.addGeneration();
    this.updateCamera();
  }

  renderUpdateFn() {
    // Keep directional light at camera position so cubes are always lit from the viewer's angle
    if (this.directionalLight) {
      this.directionalLight.position.copy(this.camera.position);
    }
  }

  updateCellShape(cellShape?: any) {
    if (cellShape) {
      this.cellShape = cellShape;
    } else {
      const maxDim = Math.max(
        this._populationShape.x || 1,
        this._populationShape.y || 1,
        this._populationShape.z || 1
      );
      const diameter = +(this.containerWidth * 0.5 / maxDim).toFixed(2);
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
    if (this.directionalLight) {
      if (this.directionalLight.target) {
        this.scene.remove(this.directionalLight.target);
      }
      this.scene.remove(this.directionalLight);
      this.dispose(this.directionalLight);
    }
  }

  createLight() {
    this.ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(200, 500, 300);
    this.directionalLight.target.position.set(0, 0, 0);
    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target);

    this.light = this.directionalLight;
  }
}
