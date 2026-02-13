import { Scene, WebGLRenderer, PerspectiveCamera, OrthographicCamera, Vector3 } from 'three';
import type { Camera, Material, BufferGeometry, Mesh, Object3D } from 'three';
import render from './render';

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export interface CellState {
  role: string;
  color: HSLColor;
}

export type TrailStepFn = 'linear' | 'exponential' | 'none';

export interface TrailConfig {
  color: HSLColor;
  size: number;
  stepFn: TrailStepFn;
}

export interface ViewerConstructorOptions {
  containerEl: HTMLElement;
  type?: string;
  populationShape: any;
  retrieveNextGeneration: () => any;
  latticeType?: string;
}

export default class BaseClass {
  debug?: string;
  runSimulation = false;
  cellShape: any;
  containerEl: HTMLElement;
  type: string;
  retrieveNextGeneration: () => any;
  _latticeType: string;

  _states: Record<number, HSLColor> = {
    0: { h: 360, s: 1, l: 1, a: 1 },
    1: { h: 0, s: 0, l: 0, a: 1 },
  };

  _hslStringStates: Record<number, string> = {
    0: 'hsla(0, 100%, 100%, 1)',
    1: 'hsla(0, 0%, 0%, 1)',
  };

  _trailConfig: TrailConfig = {
    color: { h: 180, s: 1, l: 0.65, a: 1 },
    size: 40,
    stepFn: 'linear',
  };

  set trailConfig(tc: TrailConfig) {
    this._trailConfig = tc;
  }

  get trailConfig(): TrailConfig {
    return this._trailConfig;
  }

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

  // Adaptive throttle: tracks natural frame interval during heavy computation
  // so replay from history doesn't run faster than live computation did
  private _naturalInterval = 0;
  private _lastAnimateTime = 0;

  private _resizeHandler: () => void;

  constructor({ containerEl, type, populationShape, retrieveNextGeneration, latticeType }: ViewerConstructorOptions) {
    this.containerEl = containerEl;
    this.type = type ?? '';
    this.retrieveNextGeneration = retrieveNextGeneration;
    this._latticeType = latticeType ?? 'square';

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
    const roleToIndex: Record<string, number> = { dead: 0, alive: 1 };
    return states.reduce((acc: any, { role, color }) => {
      const idx = roleToIndex[role] ?? (role.startsWith('alive ') ? parseInt(role.split(' ')[1], 10) : 0);
      acc[idx] = fn ? fn(color) : color;
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
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.style.display = 'block';
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
    // Position camera so the visible height exactly matches containerHeight
    const z = CONTAINER_HEIGHT / (2 * Math.tan((VIEW_ANGLE / 2) * Math.PI / 180));
    const FAR = Math.max(1000, z * 3);
    this.camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR);
    this.camera.position.set(0, 0, z);
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
    this._lastAnimateTime = 0;
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
    if (this.camera) {
      const width = this.containerWidth;
      const height = this.containerHeight;
      const safeHeight = height || 1;

      if ('isOrthographicCamera' in this.camera && (this.camera as any).isOrthographicCamera) {
        const oc = this.camera as OrthographicCamera;
        oc.left = -width / 2;
        oc.right = width / 2;
        oc.top = height / 2;
        oc.bottom = -height / 2;
      } else if ('aspect' in this.camera) {
        const pc = this.camera as PerspectiveCamera;
        pc.aspect = width / safeHeight;
        // Reposition camera so content fills the view at new size
        const z = safeHeight / (2 * Math.tan((pc.fov / 2) * Math.PI / 180));
        pc.position.z = z;
        pc.far = Math.max(1000, z * 3);
      }
    }
    this.updateCamera();
  }

  clearGenerations() {
    while (this.meshes.length > 0) {
      this.cleanUpRefsByMesh(this.meshes[0], true);
    }
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
        const now = performance.now();
        const elapsed = this._lastAnimateTime > 0 ? now - this._lastAnimateTime : Infinity;

        // Skip frame if replaying faster than the natural computation rate
        if (this._naturalInterval > 0 && elapsed < this._naturalInterval * 0.8) {
          return;
        }

        this._lastAnimateTime = now;
        this.animateUpdateFn();

        // Track interval from frames where computation was heavy (>1 rAF frame)
        // Replay frames are fast (~16ms) so they won't update this
        if (elapsed > 20 && elapsed < 500) {
          this._naturalInterval = this._naturalInterval === 0
            ? elapsed
            : this._naturalInterval * 0.9 + elapsed * 0.1;
        }
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
