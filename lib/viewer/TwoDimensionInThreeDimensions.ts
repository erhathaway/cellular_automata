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

export default class TwoDimensionViewerInThreeDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;
  generationsToShow = 60;
  controls?: OrbitControls;
  ambientLight?: AmbientLight;
  directionalLight?: DirectionalLight;

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'two-dimension-in-three-dimensions' });

    this.populationShape = opts.populationShape;
    this.updateRateInMS = 100;
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
    (this.camera as OrthographicCamera).zoom = 0.3;
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
      transparent: true,
      opacity: 1,
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

  clearGenerations() {
    super.clearGenerations();
    this.currentGenerationCount = 0;
    this.scene.position.set(0, -200, 0);
    if (this.directionalLight) {
      this.directionalLight.position.set(200, 500, 300);
      this.directionalLight.target.position.set(0, 0, 0);
    }
  }

  initialize() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.createLight();
  }

  updateTrailAppearance() {
    const count = this.meshes.length;
    const { h, s, l } = this.states[1];
    const sPercent = Math.floor(s * 100);
    const lPercent = Math.floor(l * 100);

    for (let i = 0; i < count; i++) {
      const group = this.meshes[i] as Group;
      // oldest = index 0, newest = index count-1
      const t = count > 1 ? i / (count - 1) : 1;
      const opacity = 0.05 + t * 0.95;
      // Shift hue: oldest → +270° from base, newest → base hue
      const hue = (h + (1 - t) * 270) % 360;
      // Shift lightness: oldest → 85%, newest → original
      const lightness = Math.floor(85 - t * (85 - lPercent));
      // Shift saturation: oldest → 30%, newest → original
      const sat = Math.floor(30 + t * (sPercent - 30));
      if (group.children.length > 0) {
        const mat = (group.children[0] as Mesh).material as MeshLambertMaterial;
        mat.opacity = opacity;
        mat.color.set(new Color(`hsl(${Math.floor(hue)}, ${sat}%, ${lightness}%)`));
      }
    }
  }

  animateUpdateFn() {
    this.addGeneration();
    if (this.directionalLight) {
      this.directionalLight.position.y += this.cellShape.y;
      this.directionalLight.target.position.y += this.cellShape.y;
    }
    this.scene.translateY(-this.cellShape.y);
    if (this.meshes.length > this.generationsToShow) {
      this.removeGeneration();
    }
    this.updateTrailAppearance();
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

    // Keep base class reference for cleanup in quit()
    this.light = this.directionalLight;
  }
}
