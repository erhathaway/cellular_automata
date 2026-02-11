import { Scene, WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import type { Camera, Material, BufferGeometry, Mesh, Object3D } from 'three';
import render from './render';

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export interface CellState {
  number: number;
  color: HSLColor;
}

export interface ViewerConstructorOptions {
  containerEl: HTMLElement;
  type?: string;
  populationShape: any;
  retrieveNextGeneration: () => any;
}

export default class BaseClass {
  debug?: string;
  runSimulation = false;
  cellShape: any;
  containerEl: HTMLElement;
  type: string;
  retrieveNextGeneration: () => any;

  _states: Record<number, HSLColor> = {
    0: { h: 360, s: 1, l: 1, a: 1 },
    1: { h: 0, s: 0, l: 0, a: 1 },
  };

  _hslStringStates: Record<number, string> = {
    0: 'hsla(0, 100%, 100%, 1)',
    1: 'hsla(0, 0%, 0%, 1)',
  };

  materials: Material[] = [];
  geometries: BufferGeometry[] = [];
  meshes: Object3D[] = [];
  vectors: Vector3[] = [];

  scene!: Scene;
  renderer!: WebGLRenderer;
  camera!: Camera;
  light?: any;
  cancelRender?: () => void;
  elID: string;

  updateRateInMS?: number;
  updateStartTime: number;

  private _resizeHandler: () => void;

  constructor({ containerEl, type, populationShape, retrieveNextGeneration }: ViewerConstructorOptions) {
    this.containerEl = containerEl;
    this.type = type ?? '';
    this.retrieveNextGeneration = retrieveNextGeneration;

    this.initScene();
    this.initRenderer();
    this.initCamera();

    this.elID = this.type + '-automata-viewer';
    this.renderer.domElement.id = this.elID;

    this._resizeHandler = () => this._handleWindowResize();
    window.addEventListener('resize', this._resizeHandler);

    this.updateRateInMS = undefined;
    this.updateStartTime = new Date().getTime();
  }

  get states(): Record<number, HSLColor> {
    return this._states;
  }

  set states(states: any) {
    this._states = this.generateStatesObject(states as CellState[]);
    this._hslStringStates = this.generateStatesObject(states as CellState[], this.convertHSLObjToHSLString);
  }

  generateStatesObject(states: CellState[], fn?: (color: HSLColor) => string): any {
    return states.reduce((acc: any, { number, color }) => {
      acc[number] = fn ? fn(color) : color;
      return acc;
    }, {});
  }

  convertHSLObjToHSLString({ h, s, l }: HSLColor): string {
    return `hsl(${Math.floor(h)}, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%)`;
  }

  get hslStringStates() {
    return this._hslStringStates;
  }

  initScene() {
    this.scene = new Scene();
    this.updateScene();
  }

  updateScene() {}

  initRenderer() {
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.updateRenderer();
  }

  updateRenderer = () => {
    try {
      if (this.renderer) {
        this.renderer.setSize(this.containerWidth, this.containerHeight);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  initCamera() {
    const CONTAINER_WIDTH = this.containerWidth;
    const CONTAINER_HEIGHT = this.containerHeight;
    const ASPECT_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;
    const VIEW_ANGLE = 91;
    const NEAR = 0.1;
    const FAR = 500;
    this.camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR);
    this.camera.position.set(0, 0, 360);
    this.camera.lookAt(this.scene.position);
    this.updateCamera();
  }

  updateCamera() {
    if (this.camera && 'updateProjectionMatrix' in this.camera) {
      (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }
  }

  turnSimulationOff() {
    this.runSimulation = false;
  }
  turnSimulationOn() {
    this.runSimulation = true;
  }

  get containerWidth() {
    return this.containerEl.clientWidth;
  }

  get containerHeight() {
    return this.containerEl.clientHeight;
  }

  private _handleWindowResize() {
    this.handleWindowResize();
    this.updateRenderer();
    if (this.camera && 'aspect' in this.camera) {
      (this.camera as PerspectiveCamera).aspect = this.containerWidth / this.containerHeight;
    }
    this.updateCamera();
  }

  // Subclass methods — override in child classes
  handleWindowResize() {}
  addGeneration() {}
  removeGeneration() {}
  initialize() {}
  animateUpdateFn() {}
  renderUpdateFn() {}
  updateCellShape(_cellShape?: any) {}
  set populationShape(_shape: any) {}
  customObjectsCleanup() {}

  _updateFn = () => {
    this.renderUpdateFn();

    if (this.runSimulation === true) {
      if (this.updateRateInMS) {
        const currentTime = new Date().getTime();
        if (currentTime - this.updateStartTime >= this.updateRateInMS) {
          this.updateStartTime = currentTime;
          this.animateUpdateFn();
        }
      } else {
        this.animateUpdateFn();
      }
    }
  };

  createScene = () => {
    this.initialize();
    this.containerEl.appendChild(this.renderer.domElement);
    this.cancelRender = render({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
      updateFn: this._updateFn,
    });
  };

  dispose = (obj: any) => {
    if (obj === undefined) return;
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key].dispose === 'function') {
        try {
          this.dispose(obj[key]);
        } catch (_e) {}
      }
      if (typeof obj.dispose === 'function') {
        try {
          obj.dispose();
        } catch (_e) {}
      }
      if (key !== 'forceContextLoss') {
        try {
          obj[key] = null;
        } catch (_e) {}
      }
    });
  };

  cleanUpRefsByMesh = (mesh: any, deleteMesh?: boolean) => {
    if (mesh === undefined) return;
    if (deleteMesh && mesh.uuid) {
      try {
        this.meshes = this.meshes.filter((obj) => obj.uuid !== mesh.uuid);
      } catch (e) {
        console.warn(e);
      }
    }

    const geometry = mesh.geometry;
    if (geometry && geometry.uuid) {
      try {
        this.geometries = this.geometries.filter((obj) => obj.uuid !== geometry.uuid);
      } catch (e) {
        console.warn(e);
      }
    }

    const material = mesh.material;
    if (material && material.uuid) {
      try {
        this.materials = this.materials.filter((obj) => obj.uuid !== material.uuid);
      } catch (e) {
        console.warn(e);
      }
    }

    this.scene.remove(mesh);
    this.dispose(geometry);
    this.dispose(material);
    this.dispose(mesh);
  };

  quit = () => {
    this.turnSimulationOff();
    window.removeEventListener('resize', this._resizeHandler);

    if (this.cancelRender) this.cancelRender();

    // Remove DOM element BEFORE disposing (dispose nullifies properties)
    const domEl = this.renderer?.domElement;

    this.meshes.forEach((m) => this.cleanUpRefsByMesh(m, true));
    this.customObjectsCleanup();
    this.dispose(this.camera);
    this.dispose(this.light);
    this.dispose(this.scene);

    try {
      this.renderer.forceContextLoss();
    } catch (_e) {}

    if (domEl && domEl.parentNode) {
      domEl.parentNode.removeChild(domEl);
    }

    this.dispose(this.renderer);

    this.renderer = null as any;
    this.camera = null as any;
    this.scene = null as any;
    this.light = null;
  };
}
