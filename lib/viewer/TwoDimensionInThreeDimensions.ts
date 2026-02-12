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
  Group,
  Scene,
  WebGLRenderer,
} from 'three';
import type { BufferGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';
import { getLattice, generateNeighborhood } from '../automata/lattice';
import type { LatticeType, GeometryType } from '../automata/lattice';

export default class TwoDimensionViewerInThreeDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;
  generationsToShow = 60;
  controls?: OrbitControls;
  ambientLight?: AmbientLight;
  directionalLight?: DirectionalLight;
  private _previewRenderer?: WebGLRenderer;

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

  // Cached per-shape geometries and shapeAt function for multi-shape lattices
  private _shapeGeometries: BufferGeometry[] | null = null;
  private _shapeAt: ((x: number, y: number) => number) | null = null;

  private _createGeometryForType(type: GeometryType, diameter: number, rotationY: number = 0): BufferGeometry {
    let geom: BufferGeometry;
    switch (type) {
      case 'hexprism': {
        const r = diameter / 2;
        geom = new CylinderGeometry(r, r, diameter, 6);
        geom.rotateY(Math.PI / 6);
        break;
      }
      case 'triprism': {
        const r = diameter / 2;
        geom = new CylinderGeometry(r, r, diameter, 3);
        break;
      }
      case 'octprism': {
        const r = diameter / 2;
        geom = new CylinderGeometry(r, r, diameter, 8);
        break;
      }
      case 'box':
      default:
        geom = new BoxGeometry(diameter, diameter, diameter);
    }
    if (rotationY) geom.rotateY(rotationY);
    return geom;
  }

  private _createCellGeometry(diameter: number): BufferGeometry {
    const lattice = getLattice(this._latticeType as LatticeType);
    return this._createGeometryForType(lattice.geometry ?? 'box', diameter);
  }

  private _ensureShapeGeometries(diameter: number): void {
    const lattice = getLattice(this._latticeType as LatticeType);
    if (!lattice.shapes) {
      this._shapeGeometries = null;
      this._shapeAt = null;
      return;
    }
    const neighborhood = generateNeighborhood(this._latticeType as LatticeType, 1);
    this._shapeAt = neighborhood.shapeAt ?? null;
    this._shapeGeometries = lattice.shapes.map(shape =>
      this._createGeometryForType(shape.geometry, diameter * shape.geometryScale, shape.geometryRotationY)
    );
  }

  addGeneration() {
    const diameter = this.cellShape.x;
    const material = new MeshLambertMaterial({
      color: new Color(this.hslStringStates[1]),
      transparent: true,
      opacity: 1,
    });
    this.materials.push(material);

    // Build per-shape geometries if multi-shape, else single geometry
    this._ensureShapeGeometries(diameter);
    const useShapes = this._shapeGeometries && this._shapeAt;
    const singleGeometry = useShapes ? null : this._createCellGeometry(diameter);
    const geometriesToTrack = useShapes ? this._shapeGeometries! : [singleGeometry!];
    for (const g of geometriesToTrack) this.geometries.push(g);

    const group = new Group();
    const generationState = this.retrieveNextGeneration() as number[][];

    if (this._populationShape.x !== generationState.length) {
      this.populationShape = { x: generationState.length };
    }

    const lattice = getLattice(this._latticeType as LatticeType);
    const pos2D = lattice.position2D;
    const size = this.cellShape.x;

    // Compute center offset using lattice positioning
    const midCol = (this._populationShape.x - 1) / 2;
    const midRow = ((this._populationShape.y || this._populationShape.x) - 1) / 2;
    let cx = 0, cz = 0;
    if (pos2D) {
      const mid = pos2D(midCol, midRow, size);
      cx = mid.x;
      cz = mid.y;
    } else {
      cx = size * midCol;
      cz = size * midRow;
    }

    const startY = this.currentGenerationCount * this.cellShape.z;

    generationState.forEach((column: number[], columnNumber: number) => {
      column.forEach((cellState: number, cellNumber: number) => {
        if (cellState === 1) {
          let px: number, pz: number;
          if (pos2D) {
            const p = pos2D(columnNumber, cellNumber, size);
            px = p.x - cx;
            pz = p.y - cz;
          } else {
            px = size * columnNumber - cx;
            pz = size * cellNumber - cz;
          }
          const geom = useShapes
            ? this._shapeGeometries![this._shapeAt!(columnNumber, cellNumber)]
            : singleGeometry!;
          const cube = new Mesh(geom, material);
          cube.position.set(px, 0, pz);
          group.add(cube);
        }
      });
    });

    group.position.y = startY;
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
    const last = count - 1;

    for (let i = 0; i < count; i++) {
      const group = this.meshes[i] as Group;
      if (group.children.length === 0) continue;
      const mat = (group.children[0] as Mesh).material as MeshLambertMaterial;

      if (i === last) {
        // Active generation: solid black
        mat.opacity = 1;
        mat.color.set(new Color(0x000000));
      } else {
        // Trail: user color with gradient
        const t = count > 1 ? i / (count - 1) : 1;
        const opacity = 0.05 + t * 0.95;
        const hue = (h - (1 - t) * 190 + 360) % 360;
        const lightness = Math.floor(lPercent + (1 - t) * (95 - lPercent));
        const sat = Math.floor(sPercent + (1 - t) * (100 - sPercent));
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
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter, z: diameter };
    }
  }

  set populationShape(populationShape: any) {
    this._populationShape = populationShape;
    this.updateCellShape();
  }

  renderPreview(populations: number[][][], canvas: HTMLCanvasElement) {
    if (!this._previewRenderer) {
      this._previewRenderer = new WebGLRenderer({ alpha: true, antialias: true });
    }

    const w = canvas.width || 160;
    const h = canvas.height || 160;
    this._previewRenderer.setSize(w, h);
    this._previewRenderer.setClearColor(new Color(this.hslStringStates[0]), 1);

    // Build temp scene with lighting
    const tempScene = new Scene();
    const ambient = new AmbientLight(0xffffff, 0.5);
    tempScene.add(ambient);
    const dirLight = new DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(200, 500, 300);
    tempScene.add(dirLight);

    const diameter = this.cellShape.x;
    const geom = new BoxGeometry(diameter, diameter, diameter);
    const xOff = (this._populationShape.x * diameter) / 2;
    const yOff = ((this._populationShape.y || this._populationShape.x) * diameter) / 2;
    const count = populations.length;

    const { h: baseH, s, l } = this.states[1];
    const sPercent = Math.floor(s * 100);
    const lPercent = Math.floor(l * 100);

    const materialsToDispose: MeshLambertMaterial[] = [];

    // Stack generations along Y, oldest at bottom, newest at top
    for (let gi = 0; gi < count; gi++) {
      const population = populations[gi];
      const isNewest = gi === count - 1;

      let mat: MeshLambertMaterial;
      if (isNewest) {
        // Active generation: solid black
        mat = new MeshLambertMaterial({ color: new Color(0x000000), transparent: true, opacity: 1 });
      } else {
        const t = count > 1 ? gi / (count - 1) : 1;
        const opacity = 0.05 + t * 0.95;
        const hue = (baseH - (1 - t) * 190 + 360) % 360;
        const lightness = Math.floor(lPercent + (1 - t) * (95 - lPercent));
        const sat = Math.floor(sPercent + (1 - t) * (100 - sPercent));
        mat = new MeshLambertMaterial({
          color: new Color(`hsl(${Math.floor(hue)}, ${sat}%, ${lightness}%)`),
          transparent: true,
          opacity,
        });
      }
      materialsToDispose.push(mat);

      const group = new Group();
      population.forEach((col: number[], colNum: number) => {
        col.forEach((cell: number, cellNum: number) => {
          if (cell === 1) {
            const cube = new Mesh(geom, mat);
            cube.position.set(
              diameter * colNum - xOff,
              0,
              diameter * cellNum - yOff
            );
            group.add(cube);
          }
        });
      });

      // Center the stack vertically around origin
      group.position.y = (gi - count / 2) * diameter;
      tempScene.add(group);
    }

    // Camera matching current view angle relative to origin
    // Scale zoom proportionally: preview frustum is smaller than main viewport
    const mainCam = this.camera as OrthographicCamera;
    const cam = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 10000);
    if (this.controls) {
      const offset = new Vector3().copy(this.camera.position).sub(this.controls.target);
      cam.position.copy(offset);
    } else {
      cam.position.set(-350, 800, 685);
    }
    cam.lookAt(0, 0, 0);
    const scaleRatio = w / this.containerWidth;
    cam.zoom = mainCam.zoom * scaleRatio * 1.75;
    cam.updateProjectionMatrix();

    this._previewRenderer.render(tempScene, cam);

    // Copy to preview canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(this._previewRenderer.domElement, 0, 0);
    }

    // Cleanup temp objects
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

    // Keep base class reference for cleanup in quit()
    this.light = this.directionalLight;
  }
}
