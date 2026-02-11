import {
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  Vector3,
  Color,
} from 'three';
import BaseClass from './base';
import type { ViewerConstructorOptions } from './base';

export default class OneDimensionViewerInTwoDimensions extends BaseClass {
  currentGenerationCount = 0;
  distanceToMoveOnAnimation = 0;
  totalDistanceToMovePerAnimation = 0;
  _animationStepsPerUpdate = 2;
  currrentGenerationYPosition: number;
  _populationShape: any;
  padding = { top: -40, bottom: -40 };

  constructor(opts: ViewerConstructorOptions) {
    super({ ...opts, type: 'one-dimension' });

    this.currrentGenerationYPosition = (this.containerHeight / 2) * -1;
    this.populationShape = opts.populationShape;
  }

  handleWindowResize() {
    this.updateCellShape();
  }

  addGeneration() {
    const lastGeneration = this.meshes.slice(-1)[0];
    let y: number | undefined;

    if (lastGeneration !== undefined) {
      y = lastGeneration.getWorldPosition(new Vector3()).y;
    }

    if (y === undefined || y < this.containerHeight / 2 - this.padding.top) {
      const material = new PointsMaterial({
        color: new Color(this.hslStringStates[1]),
        size: this.cellShape.x,
        sizeAttenuation: true,
      });
      this.materials.push(material);

      const generationState = this.retrieveNextGeneration() as number[];

      if (this._populationShape.x !== generationState.length) {
        this.populationShape = { x: generationState.length };
      }

      const xOffset = this.containerWidth / 2;
      const startY = this.currrentGenerationYPosition;

      const positions: number[] = [];
      generationState.forEach((cellState: number, cellNumber: number) => {
        if (cellState === 1) {
          const startX = this.cellShape.x * cellNumber - xOffset;
          positions.push(startX, 0, 0);
        }
      });

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this.geometries.push(geometry);

      const pointField = new Points(geometry, material);
      pointField.position.y = startY;
      this.meshes.push(pointField);
      this.scene.add(pointField);

      this.currentGenerationCount += 1;
      this.currrentGenerationYPosition += this.cellShape.y;
    }
  }

  removeGeneration() {
    for (let i = 0; i < this.meshes.length; i++) {
      const m = this.meshes[i];
      if (m === undefined) break;
      const meshY = m.getWorldPosition(new Vector3()).y;
      if (meshY < -this.containerHeight / 2 + this.padding.bottom) {
        this.scene.remove(this.camera);
        const mesh = this.meshes.shift()!;
        this.cleanUpRefsByMesh(mesh);
      } else {
        break;
      }
    }
  }

  clearGenerations() {
    super.clearGenerations();
    this.currentGenerationCount = 0;
    this.currrentGenerationYPosition = (this.containerHeight / 2) * -1;
  }

  initialize() {}

  animateUpdateFn() {
    this.removeGeneration();
    this.addGeneration();

    if (this.totalDistanceToMovePerAnimation <= 0) {
      this.resetTotalDistanceToMovePerAnimation();
    } else {
      this.scene.translateY(-this.distanceToMoveOnAnimation);
      this.totalDistanceToMovePerAnimation -= this.distanceToMoveOnAnimation;
    }
  }

  renderUpdateFn() {}

  updateCellShape(cellShape?: any) {
    if (cellShape) {
      this.cellShape = cellShape;
    } else {
      const diameter = +(this.containerWidth / this._populationShape.x).toFixed(2);
      this.cellShape = { x: diameter, y: diameter };
    }
    this.updateDistanceToMoveOnAnimation();
    this.resetTotalDistanceToMovePerAnimation();
  }

  set populationShape(populationShape: any) {
    this._populationShape = populationShape;
    this.updateCellShape();
  }

  customObjectsCleanup() {}

  resetTotalDistanceToMovePerAnimation() {
    this.totalDistanceToMovePerAnimation = this.cellShape.x;
  }

  set animationStepsPerUpdate(steps: number) {
    this._animationStepsPerUpdate = steps;
    this.updateDistanceToMoveOnAnimation();
  }

  updateDistanceToMoveOnAnimation() {
    this.distanceToMoveOnAnimation = this.cellShape.x / this._animationStepsPerUpdate;
  }

  get maxGenerationsToShow() {
    const max = Math.ceil(this.containerHeight / this.cellShape.y) + 2;
    return max;
  }
}
