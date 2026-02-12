import {
  MeshBasicMaterial,
  PlaneGeometry,
  CircleGeometry,
  InstancedMesh,
  Group,
  Object3D,
  OrthographicCamera,
  Color,
} from 'three';
import type { BufferGeometry } from 'three';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';
import { getLattice, generateNeighborhood } from '../automata/lattice';
import type { LatticeType, GeometryType } from '../automata/lattice';

// Number of sides for CircleGeometry per geometry type
const POLYGON_SIDES: Record<string, number> = {
  hexprism: 6,
  triprism: 3,
  octprism: 8,
  sphere: 32,
};

export default class TwoDimensionViewerInTwoDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;

  // Cached per viewer lifetime (lattice doesn't change within a viewer instance)
  private _shapeAt: ((x: number, y: number) => number) | null = null;
  private _shapeAtInitialized = false;
  private _nearestDistPerUnit: number | null = null;

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'two-dimension-in-two-dimensions' });

    this.populationShape = opts.populationShape;
  }

  initCamera() {
    this._setupOrthoCamera();
  }

  private _setupOrthoCamera() {
    const w = this.containerWidth || 1;
    const h = this.containerHeight || 1;
    this.camera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
    (this.camera as OrthographicCamera).updateProjectionMatrix();
  }

  handleWindowResize() {
    const cam = this.camera as OrthographicCamera;
    const w = this.containerWidth;
    const h = this.containerHeight;
    cam.left = -w / 2;
    cam.right = w / 2;
    cam.top = h / 2;
    cam.bottom = -h / 2;
    cam.updateProjectionMatrix();
    this.updateCellShape();
  }

  private _ensureShapeAt(): void {
    if (this._shapeAtInitialized) return;
    this._shapeAtInitialized = true;
    const lattice = getLattice(this._latticeType as LatticeType);
    if (lattice.shapes) {
      const neighborhood = generateNeighborhood(this._latticeType as LatticeType, 1);
      this._shapeAt = neighborhood.shapeAt ?? null;
    }
  }

  /**
   * Nearest-neighbor distance per unit size for the current lattice.
   * Computed once and cached.
   */
  private _getNearestDistPerUnit(): number {
    if (this._nearestDistPerUnit !== null) return this._nearestDistPerUnit;
    const lattice = getLattice(this._latticeType as LatticeType);
    const pos2D = lattice.position2D;
    if (!pos2D) { this._nearestDistPerUnit = 1; return 1; }
    const origin = pos2D(10, 10, 1);
    let minDist = Infinity;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const p = pos2D(10 + dx, 10 + dy, 1);
        const dist = Math.sqrt((p.x - origin.x) ** 2 + (p.y - origin.y) ** 2);
        if (dist > 0.001 && dist < minDist) minDist = dist;
      }
    }
    this._nearestDistPerUnit = minDist;
    return minDist;
  }

  /**
   * Create a flat polygon geometry sized for gap-free tiling.
   *
   * For 'box': creates PlaneGeometry with the given side length.
   * For polygon types: creates CircleGeometry with the given circumradius.
   */
  private _createFlatPolygon(type: GeometryType, sizeOrRadius: number, rotationZ: number = 0): BufferGeometry {
    let geom: BufferGeometry;
    if (type === 'box') {
      geom = new PlaneGeometry(sizeOrRadius, sizeOrRadius);
    } else {
      const sides = POLYGON_SIDES[type] ?? 32;
      geom = new CircleGeometry(sizeOrRadius, sides);
      if (type === 'hexprism') geom.rotateZ(Math.PI / 6);
    }
    if (rotationZ) geom.rotateZ(rotationZ);
    return geom;
  }

  /**
   * Compute gap-free geometry for a single-shape lattice cell.
   * For box: side = nearest neighbor distance.
   * For polygons: circumradius = nearestDist / (2 * cos(π/n)).
   */
  private _createSingleShapeGeometry(diameter: number): BufferGeometry {
    const lattice = getLattice(this._latticeType as LatticeType);
    const geomType = lattice.geometry ?? 'box';
    const nearestDist = this._getNearestDistPerUnit() * diameter;

    if (geomType === 'box') {
      return this._createFlatPolygon('box', nearestDist);
    }
    const sides = POLYGON_SIDES[geomType] ?? 32;
    const R = nearestDist / (2 * Math.cos(Math.PI / sides));
    return this._createFlatPolygon(geomType, R);
  }

  /**
   * Compute gap-free geometry for a multi-shape lattice cell.
   * Uses geometryScale from ShapeInfo (calibrated for r = scaledDiam/2 convention).
   */
  private _createMultiShapeGeometry(diameter: number, shapeIdx: number): BufferGeometry {
    const lattice = getLattice(this._latticeType as LatticeType);
    const shape = lattice.shapes![shapeIdx];
    const scaledDiam = diameter * shape.geometryScale;

    if (shape.geometry === 'box') {
      return this._createFlatPolygon('box', scaledDiam, shape.geometryRotationY);
    }
    return this._createFlatPolygon(shape.geometry, scaledDiam / 2, shape.geometryRotationY);
  }

  addGeneration() {
    const diameter = this.cellShape.x;

    const material = new MeshBasicMaterial({
      color: new Color(this.hslStringStates[1]),
      transparent: true,
      opacity: 1,
    });
    this.materials.push(material);

    const generationState = this.retrieveNextGeneration() as number[][];

    if (this._populationShape.x !== generationState.length) {
      this.populationShape = { x: generationState.length };
    }

    const lattice = getLattice(this._latticeType as LatticeType);
    const pos2D = lattice.position2D;
    const size = this.cellShape.x;

    // Compute center offset
    const midCol = (this._populationShape.x - 1) / 2;
    const midRow = ((this._populationShape.y || this._populationShape.x) - 1) / 2;
    let cx = 0, cy = 0;
    if (pos2D) {
      const mid = pos2D(midCol, midRow, size);
      cx = mid.x;
      cy = mid.y;
    } else {
      cx = size * midCol;
      cy = size * midRow;
    }

    this._ensureShapeAt();
    const useShapes = lattice.shapes && this._shapeAt;

    if (useShapes) {
      const shapeCount = lattice.shapes!.length;
      const shapePositions: { x: number; y: number }[][] = Array.from({ length: shapeCount }, () => []);

      generationState.forEach((column: number[], columnNumber: number) => {
        column.forEach((cellState: number, cellNumber: number) => {
          if (cellState === 1) {
            let px: number, py: number;
            if (pos2D) {
              const p = pos2D(columnNumber, cellNumber, size);
              px = p.x - cx;
              py = p.y - cy;
            } else {
              px = size * columnNumber - cx;
              py = size * cellNumber - cy;
            }
            shapePositions[this._shapeAt!(columnNumber, cellNumber)].push({ x: px, y: py });
          }
        });
      });

      const group = new Group();
      const dummy = new Object3D();
      for (let si = 0; si < shapeCount; si++) {
        const geom = this._createMultiShapeGeometry(diameter, si);
        this.geometries.push(geom);
        const positions = shapePositions[si];
        const instMesh = new InstancedMesh(geom, material, positions.length);
        for (let j = 0; j < positions.length; j++) {
          dummy.position.set(positions[j].x, positions[j].y, 0);
          dummy.updateMatrix();
          instMesh.setMatrixAt(j, dummy.matrix);
        }
        instMesh.instanceMatrix.needsUpdate = true;
        group.add(instMesh);
      }
      (group as any).material = material;
      this.meshes.push(group);
      this.scene.add(group);
    } else {
      const geom = this._createSingleShapeGeometry(diameter);
      this.geometries.push(geom);

      const positions: { x: number; y: number }[] = [];
      generationState.forEach((column: number[], columnNumber: number) => {
        column.forEach((cellState: number, cellNumber: number) => {
          if (cellState === 1) {
            let px: number, py: number;
            if (pos2D) {
              const p = pos2D(columnNumber, cellNumber, size);
              px = p.x - cx;
              py = p.y - cy;
            } else {
              px = size * columnNumber - cx;
              py = size * cellNumber - cy;
            }
            positions.push({ x: px, y: py });
          }
        });
      });

      const instMesh = new InstancedMesh(geom, material, positions.length);
      const dummy = new Object3D();
      for (let j = 0; j < positions.length; j++) {
        dummy.position.set(positions[j].x, positions[j].y, 0);
        dummy.updateMatrix();
        instMesh.setMatrixAt(j, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      this.meshes.push(instMesh);
      this.scene.add(instMesh);
    }

    this.currentGenerationCount += 1;
  }

  removeGeneration() {
    if (this.meshes.length > 40) {
      const mesh = this.meshes[0];
      this.cleanUpRefsByMesh(mesh, true);
    }
  }

  clearGenerations() {
    super.clearGenerations();
    this.currentGenerationCount = 0;
    this.updateRateInMS = undefined;
  }

  initialize() {
    // Re-setup camera here (container is guaranteed to have final dimensions)
    this._setupOrthoCamera();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.containerWidth, this.containerHeight);
  }

  animateUpdateFn() {
    this.removeGeneration();
    const colorable = this.meshes.slice(-40);
    const { h } = this.states[1];
    const trailHue = (h + 180) % 360;
    const last = colorable.length - 1;
    colorable.forEach((m: any, i: number) => {
      const mat = m.material;
      if (!mat) return;
      if (i === last) {
        mat.color.set(new Color(0x000000));
      } else {
        // t=1 at second-youngest (just after black), t=0 at oldest
        const t = last > 1 ? i / (last - 1) : 0;
        const lightness = 80 - t * 30;
        mat.color.set(new Color(`hsl(${trailHue}, 100%, ${lightness}%)`));
      }
      // z controls draw order; newest on top
      if (i === last) {
        m.position.z = 2;
      } else {
        m.position.z = i / (last || 1);
      }
    });
    this.addGeneration();

    // Gradually slow down after 100 generations
    if (this.currentGenerationCount >= 100 && !this.updateRateInMS) {
      this.updateRateInMS = 100;
    }
  }

  renderUpdateFn() {}

  updateCellShape(cellShape?: any) {
    if (cellShape) {
      this.cellShape = cellShape;
    } else {
      const cols = this._populationShape.x;
      const lattice = getLattice(this._latticeType as LatticeType);
      const pos2D = lattice.position2D;

      let diameter: number;
      if (pos2D) {
        const colSpacing = pos2D(1, 0, 1).x - pos2D(0, 0, 1).x;
        diameter = +(this.containerWidth / (colSpacing * cols)).toFixed(2);
      } else {
        diameter = +(this.containerWidth / cols).toFixed(2);
      }
      this.cellShape = { x: diameter, y: diameter };
    }
  }

  set populationShape(populationShape: any) {
    this._populationShape = populationShape;
    this.updateCellShape();
  }

  customObjectsCleanup() {}
}
