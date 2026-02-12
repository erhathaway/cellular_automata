import {
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  Color,
} from 'three';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';
import { getLattice } from '../automata/lattice';
import type { LatticeType } from '../automata/lattice';

export default class TwoDimensionViewerInTwoDimensions extends BaseClass {
  currentGenerationCount = 0;
  _populationShape: any;

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'two-dimension-in-two-dimensions' });

    this.populationShape = opts.populationShape;
  }

  handleWindowResize() {
    this.updateCellShape();
  }

  addGeneration() {
    const material = new PointsMaterial({
      color: new Color(this.hslStringStates[1]),
      size: this.cellShape.x,
      sizeAttenuation: true,
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

    const positions: number[] = [];
    generationState.forEach((column: number[], columnNumber: number) => {
      column.forEach((cellState: number, cellNumber: number) => {
        if (cellState === 1) {
          if (pos2D) {
            const p = pos2D(columnNumber, cellNumber, size);
            positions.push(p.x - cx, p.y - cy, 0);
          } else {
            positions.push(size * columnNumber - cx, size * cellNumber - cy, 0);
          }
        }
      });
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.geometries.push(geometry);

    const pointField = new Points(geometry, material);
    this.meshes.push(pointField);
    this.scene.add(pointField);

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
  }

  initialize() {}

  animateUpdateFn() {
    this.removeGeneration();
    const colorable = this.meshes.slice(-40);
    const { h, s } = this.states[1];
    const computedS = Math.floor(s * 100);
    const last = colorable.length - 1;
    colorable.forEach((m: any, i: number) => {
      if (i === last) {
        m.material.color.set(new Color(0x000000));
      } else {
        const color = new Color(`hsl(${h}, ${computedS}%, ${100 - (i + 5) * 1}%)`);
        m.material.color.set(color);
      }
      m.position.z = 1 / (i + 1);
    });
    this.addGeneration();
  }

  renderUpdateFn() {}

  updateCellShape(cellShape?: any) {
    if (cellShape) {
      this.cellShape = cellShape;
    } else {
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter };
    }
  }

  set populationShape(populationShape: any) {
    this._populationShape = populationShape;
    this.updateCellShape();
  }

  customObjectsCleanup() {}
}
