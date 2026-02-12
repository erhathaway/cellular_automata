import {
  Vector3,
  Mesh,
  MeshLambertMaterial,
  DirectionalLight,
  AmbientLight,
  OrthographicCamera,
  Color,
  BoxGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  Group,
  Scene,
  WebGLRenderer,
} from 'three';
import type { BufferGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';
import { getLattice } from '../automata/lattice';
import type { LatticeType } from '../automata/lattice';

export default class ThreeDimensionViewerInThreeDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;
  generationsToShow = 1;
  controls?: OrbitControls;
  ambientLight?: AmbientLight;
  directionalLight?: DirectionalLight;
  private _previewRenderer?: WebGLRenderer;

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

  private _createCellGeometry(diameter: number): BufferGeometry {
    const lattice = getLattice(this._latticeType as LatticeType);
    switch (lattice.geometry) {
      case 'sphere': {
        const r = diameter / 2;
        return new IcosahedronGeometry(r, 1);
      }
      case 'hexprism': {
        const r = diameter / 2;
        const geom = new CylinderGeometry(r, r, diameter, 6);
        geom.rotateY(Math.PI / 6);
        return geom;
      }
      case 'box':
      default:
        return new BoxGeometry(diameter, diameter, diameter);
    }
  }

  addGeneration() {
    const diameter = this.cellShape.x;
    const geometry = this._createCellGeometry(diameter);
    const group = new Group();

    this.geometries.push(geometry);

    const generationState = this.retrieveNextGeneration() as number[][][];

    const lattice = getLattice(this._latticeType as LatticeType);
    const pos3D = lattice.position3D;

    const shapeX = this._populationShape.x || generationState.length;
    const shapeY = this._populationShape.y || shapeX;
    const shapeZ = this._populationShape.z || shapeX;

    // Compute center offset
    let cx = 0, cy = 0, cz = 0;
    if (pos3D) {
      const midX = (shapeX - 1) / 2;
      const midY = (shapeY - 1) / 2;
      const midZ = (shapeZ - 1) / 2;
      const mid = pos3D(midX, midY, midZ, diameter);
      cx = mid.px;
      cy = mid.py;
      cz = mid.pz;
    } else {
      cx = (shapeX * diameter) / 2;
      cy = (shapeY * diameter) / 2;
      cz = (shapeZ * diameter) / 2;
    }

    generationState.forEach((column: number[][], columnNumber: number) => {
      const nx = shapeX > 1 ? columnNumber / (shapeX - 1) : 0.5;
      column.forEach((row: number[], rowNumber: number) => {
        const ny = shapeY > 1 ? rowNumber / (shapeY - 1) : 0.5;
        row.forEach((cellState: number, cellNumber: number) => {
          if (cellState === 1) {
            const nz = shapeZ > 1 ? cellNumber / (shapeZ - 1) : 0.5;

            let px: number, py: number, pz: number;
            if (pos3D) {
              const p = pos3D(columnNumber, rowNumber, cellNumber, diameter);
              px = p.px - cx;
              py = p.pz - cz; // swap py/pz for Three.js Y-up
              pz = p.py - cy;
            } else {
              px = diameter * columnNumber - cx;
              py = diameter * cellNumber - cz;
              pz = diameter * rowNumber - cy;
            }

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
            cube.position.set(px, py, pz);
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

  renderPreview(populations: number[][][][], canvas: HTMLCanvasElement) {
    // For 3D-in-3D, just render the last population (single generation view)
    const population = populations[populations.length - 1];
    if (!population) return;

    if (!this._previewRenderer) {
      this._previewRenderer = new WebGLRenderer({ alpha: true, antialias: true });
    }

    const w = canvas.width || 160;
    const h = canvas.height || 160;
    this._previewRenderer.setSize(w, h);
    this._previewRenderer.setClearColor(new Color(this.hslStringStates[0]), 1);

    const tempScene = new Scene();
    const ambient = new AmbientLight(0xffffff, 0.5);
    tempScene.add(ambient);
    const dirLight = new DirectionalLight(0xffffff, 1.0);
    // Light from camera direction
    if (this.controls) {
      const offset = new Vector3().copy(this.camera.position).sub(this.controls.target);
      dirLight.position.copy(offset);
    } else {
      dirLight.position.set(200, 500, 300);
    }
    tempScene.add(dirLight);

    const diameter = this.cellShape.x;
    const geom = new BoxGeometry(diameter, diameter, diameter);

    const shapeX = this._populationShape.x || population.length;
    const shapeY = this._populationShape.y || shapeX;
    const shapeZ = this._populationShape.z || shapeX;
    const xOff = (shapeX * diameter) / 2;
    const yOff = (shapeY * diameter) / 2;
    const zOff = (shapeZ * diameter) / 2;

    const materialsToDispose: MeshLambertMaterial[] = [];

    population.forEach((column: number[][], colNum: number) => {
      const nx = shapeX > 1 ? colNum / (shapeX - 1) : 0.5;
      column.forEach((row: number[], rowNum: number) => {
        const ny = shapeY > 1 ? rowNum / (shapeY - 1) : 0.5;
        row.forEach((cellState: number, cellNum: number) => {
          if (cellState === 1) {
            const nz = shapeZ > 1 ? cellNum / (shapeZ - 1) : 0.5;
            const hue = Math.floor(nx * 300);
            const sat = Math.floor(60 + ny * 40);
            const lit = Math.floor(35 + nz * 40);
            const mat = new MeshLambertMaterial({
              color: new Color(`hsl(${hue}, ${sat}%, ${lit}%)`),
              transparent: true,
              opacity: 0.9,
            });
            materialsToDispose.push(mat);

            const cube = new Mesh(geom, mat);
            cube.position.set(
              diameter * colNum - xOff,
              diameter * cellNum - zOff,
              diameter * rowNum - yOff
            );
            tempScene.add(cube);
          }
        });
      });
    });

    // Camera matching current view angle
    const cam = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 10000);
    if (this.controls) {
      const offset = new Vector3().copy(this.camera.position).sub(this.controls.target);
      cam.position.copy(offset);
    } else {
      cam.position.set(-350, 800, 685);
    }
    cam.lookAt(0, 0, 0);
    const mainCam = this.camera as OrthographicCamera;
    const scaleRatio = w / this.containerWidth;
    cam.zoom = mainCam.zoom * scaleRatio * 1.75;
    cam.updateProjectionMatrix();

    this._previewRenderer.render(tempScene, cam);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(this._previewRenderer.domElement, 0, 0);
    }

    geom.dispose();
    materialsToDispose.forEach(m => m.dispose());
    ambient.dispose();
    dirLight.dispose();
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
    if (this._previewRenderer) {
      try { this._previewRenderer.forceContextLoss(); } catch (_e) {}
      this._previewRenderer.dispose();
      this._previewRenderer = undefined;
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
