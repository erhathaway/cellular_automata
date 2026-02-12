<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { Color } from 'three';
  import { automataStore } from '$lib/stores/automata.svelte';
  import {
    AutomataManager,
    OneDimensionInTwoDimensions,
    TwoDimensionInTwoDimensions,
    TwoDimensionInThreeDimensions,
    ThreeDimensionInThreeDimensions,
  } from '$lib-core';

  let containerEl: HTMLDivElement;
  let automataManager: AutomataManager | undefined;
  let viewer: any = undefined;

  // Track previous values to detect changes
  let trackedDimension: number | undefined;
  let trackedViewer: number | undefined;
  let trackedResetCounter: number | undefined;
  let trackedLattice: string | undefined;
  let mounted = false;
  let pendingInit: ReturnType<typeof setTimeout> | null = null;

  // Defer initViewer to a new browser task so click handlers complete quickly.
  // Immediately tears down the old viewer and updates tracked values to prevent
  // double-firing, then schedules the heavy init work.
  function scheduleInit(shouldRun = false) {
    // Update tracked values now to prevent effects from re-firing
    trackedDimension = automataStore.dimension;
    trackedViewer = automataStore.viewer;
    trackedResetCounter = automataStore.resetCounter;
    trackedLattice = automataStore.lattice;
    // Debounce: if multiple effects trigger in the same flush, only one init runs
    if (pendingInit !== null) clearTimeout(pendingInit);
    pendingInit = setTimeout(() => {
      pendingInit = null;
      initViewer(shouldRun);
    }, 0);
  }

  function retrieveNextGeneration() {
    const pop = automataManager!.run();
    automataStore.updateGenerationInfo(
      automataManager!.currentGenerationIndex,
      automataManager!.totalGenerations,
      automataManager!.generationHistorySize
    );

    // Check for stability every 10 generations
    if (automataManager!.totalGenerations % 10 === 0) {
      const result = automataManager!.checkStability(20);
      if (result.stable && !automataStore.stableDetected) {
        automataStore.setStable(result.kind as 'exact' | 'quasi', result.period);
      }
    }

    return pop;
  }

  function setRule() {
    if (!automataManager) return;
    const rule = automataStore.rule;
    if (rule.type === 'wolfram') {
      automataManager.rule = rule.rule;
    } else {
      automataManager.rule = { survive: rule.survive, born: rule.born };
    }
    // Apply per-shape rules if multi-shape lattice
    if (automataStore.shapeRules) {
      automataManager.setShapeRules(automataStore.shapeRules);
    }
  }

  function initViewer(shouldRun = false) {
    // Quit existing viewer
    if (viewer) {
      try { viewer.quit(); } catch (_e) {}
      viewer = undefined;
    }

    if (!containerEl) return;

    automataStore.dismissStable();

    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    const shape = { ...automataStore.populationShape };

    automataManager = new AutomataManager();

    const viewerConfig = {
      containerEl,
      populationShape: shape,
      retrieveNextGeneration,
      latticeType: automataStore.lattice,
    };

    if (dim === 1 && view === 2) {
      if (automataStore.neighborhoodRadius > 1) {
        // Life-like rules for 1D with extended radius
        automataManager.useLifeLikeGenerator();
        // Wolfram rules don't work with LifeLike generator — convert
        if (automataStore.rule.type === 'wolfram') {
          automataStore.setRule({ type: 'conway', survive: [2, 3], born: [3] });
        }
      } else {
        automataManager.useOneDimensionGenerator();
      }
      automataManager.generationHistorySize = 10800;
      viewer = new OneDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 2) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 10800;
      viewer = new TwoDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 3) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 5400;
      viewer = new TwoDimensionInThreeDimensions(viewerConfig);
    } else if (dim === 3 && view === 3) {
      automataManager.useThreeDimensionGenerator();
      automataManager.generationHistorySize = 1800;
      automataManager.seedDensity = 0.12;
      viewer = new ThreeDimensionInThreeDimensions(viewerConfig);
    }

    // Apply lattice configuration with radius (all 2D/3D lattices go through the same system)
    if (dim >= 2) {
      automataManager.setLattice(automataStore.lattice, automataStore.neighborhoodRadius);
    } else if (automataStore.neighborhoodRadius > 1) {
      // 1D doesn't use lattice system, just set neighbors directly
      automataManager.neighbors = automataStore.neighbors;
    }

    // Wire preview callbacks
    automataStore.getPopulationAtIndex = (index: number) => {
      if (!automataManager) return null;
      return automataManager.getPopulationAtIndex(index);
    };
    automataStore.renderPreviewFrame = (populations: any[], canvas: HTMLCanvasElement) => {
      if (viewer?.renderPreview) viewer.renderPreview(populations, canvas);
    };
    automataStore.getCanvasDataURL = () => {
      if (!viewer?.renderer?.domElement) return null;
      return viewer.renderer.domElement.toDataURL('image/png');
    };
    automataStore.captureThumbnail = () => {
      if (!viewer?.renderer?.domElement) return null;
      const source = viewer.renderer.domElement;
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = Math.round(120 * (source.height / source.width)) || 90;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      // Fill white first — WebGL canvas has alpha, transparent areas become black in JPEG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.5);
    };
    automataStore.getSeedSnapshot = () => {
      if (!automataManager) return null;
      const pop = automataManager.getPopulationAtIndex(0);
      if (!pop) return null;
      return automataManager._snapshotPopulation(pop);
    };
    automataStore.getCurrentPopulationSnapshot = () => {
      if (!automataManager) return null;
      const pop = automataManager.getPopulationAtIndex(automataStore.generationIndex);
      if (!pop) return null;
      return automataManager._snapshotPopulation(pop);
    };

    if (viewer) {
      // Set cell state colors
      viewer.states = automataStore.cellStates;

      // Set rule on automata manager
      setRule();

      // Create Three.js scene
      viewer.createScene();

      // Create genesis population
      automataManager!.populationShape = shape;
      if (automataStore.savedSeed && automataStore.useSavedSeed) {
        automataManager!.setSeedPopulation(automataStore.savedSeed);
      } else {
        automataManager!.getSeedPopulation();
      }

      // Pre-fill for 1D viewer
      let preFilled = 0;
      if (dim === 1 && viewer.maxGenerationsToShow) {
        for (let i = 0; i < viewer.maxGenerationsToShow; i++) {
          viewer.addGeneration();
        }
        preFilled = viewer.maxGenerationsToShow;
      }

      // Auto-advance to target generation from URL
      const target = automataStore.targetGeneration;
      if (target > 0) {
        const remaining = target - preFilled;
        for (let i = 0; i < remaining; i++) {
          viewer.addGeneration();
        }
        automataStore.targetGeneration = 0;
      }

      // Start simulation
      if (shouldRun || automataStore.isPlaying) {
        viewer.turnSimulationOn();
      }
    }

    trackedDimension = dim;
    trackedViewer = view;
    trackedResetCounter = automataStore.resetCounter;
    trackedLattice = automataStore.lattice;
  }

  onMount(() => {
    mounted = true;
    initViewer(true);
    automataStore.play();
  });

  onDestroy(() => {
    mounted = false;
    if (pendingInit !== null) {
      clearTimeout(pendingInit);
      pendingInit = null;
    }
    automataStore.getPopulationAtIndex = null;
    automataStore.renderPreviewFrame = null;
    automataStore.getCanvasDataURL = null;
    automataStore.captureThumbnail = null;
    automataStore.getSeedSnapshot = null;
    automataStore.getCurrentPopulationSnapshot = null;
    if (viewer) {
      try { viewer.quit(); } catch (_e) {}
      viewer = undefined;
    }
  });

  // Watch for dimension/viewer changes — reinitialize viewer
  $effect(() => {
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    if (!mounted) return;
    if (trackedDimension !== undefined && (dim !== trackedDimension || view !== trackedViewer)) {
      scheduleInit(true);
    }
  });

  // Watch for lattice changes — reinitialize viewer
  $effect(() => {
    const lat = automataStore.lattice;
    if (!mounted) return;
    if (trackedLattice !== undefined && lat !== trackedLattice) {
      scheduleInit(true);
    }
  });

  // Watch for reset
  $effect(() => {
    const rc = automataStore.resetCounter;
    if (!mounted) return;
    if (trackedResetCounter !== undefined && rc !== trackedResetCounter) {
      scheduleInit(true);
    }
  });

  // Watch for play/pause
  $effect(() => {
    const playing = automataStore.isPlaying;
    if (!viewer) return;
    if (playing) {
      viewer.turnSimulationOn();
    } else {
      viewer.turnSimulationOff();
    }
  });

  // Watch for cell state color changes
  $effect(() => {
    const states = automataStore.cellStates;
    if (!viewer) return;
    viewer.states = states;
  });

  // Watch for shape changes (without reinitializing viewer)
  $effect(() => {
    const shape = automataStore.populationShape;
    if (!automataManager) return;
    automataManager.populationShape = { ...shape };
  });

  // Watch for rule changes
  $effect(() => {
    const _rule = automataStore.rule;
    if (!automataManager) return;
    setRule();
  });

  // Watch for shape rule changes
  $effect(() => {
    const sr = automataStore.shapeRules;
    if (!automataManager || !sr) return;
    automataManager.setShapeRules(sr);
  });

  // Watch for neighborhood radius changes
  $effect(() => {
    const _neighbors = automataStore.neighbors;
    const lattice = automataStore.lattice;
    const radius = automataStore.neighborhoodRadius;
    if (!automataManager) return;
    if (automataStore.dimension >= 2) {
      automataManager.setLattice(lattice, radius);
    } else {
      automataManager.neighbors = _neighbors;
    }
  });

  // Watch for seek target
  $effect(() => {
    const target = automataStore.seekTarget;
    if (target === null || !automataManager || !viewer) return;

    // Determine trail size based on viewer type
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    let trailSize = 1;
    if (dim === 2 && view === 2) trailSize = 40;
    else if (dim === 2 && view === 3) trailSize = 60;
    else if (dim === 1 && view === 2) trailSize = viewer.maxGenerationsToShow || 100;

    // Seek automata manager to a position that allows trail preloading
    const seekStart = Math.max(0, target - trailSize);
    automataManager.seekTo(seekStart);

    // Clear all viewer meshes
    viewer.clearGenerations();

    // Preload trail by stepping through history
    const steps = target - seekStart;
    for (let i = 0; i < steps; i++) {
      viewer.addGeneration();
    }

    // Ensure automata is at target (1D guard can block some addGeneration calls)
    automataManager.seekTo(target);

    // For 2D-in-3D: scroll scene and light to match preloaded generations
    if (dim === 2 && view === 3 && viewer.cellShape) {
      const scrollY = steps * viewer.cellShape.y;
      viewer.scene.translateY(-scrollY);
      if (viewer.directionalLight) {
        viewer.directionalLight.position.y += scrollY;
        viewer.directionalLight.target.position.y += scrollY;
      }
      viewer.updateTrailAppearance();
    }

    // Apply color gradient for 2D-2D viewer
    if (dim === 2 && view === 2 && viewer.meshes) {
      const colorable = viewer.meshes.slice(-40);
      const { h, s } = viewer.states[1];
      const computedS = Math.floor(s * 100);
      const last = colorable.length - 1;
      colorable.forEach((m: any, i: number) => {
        if (i === last) {
          m.material.color.set(new Color(0x000000));
        } else {
          const color = new Color(`hsl(${h}, ${computedS}%, ${100 - (i + 5) * 1}%)`);
          m.material.color.set(color);
        }
        // Keep trail ordered with older generations in front of newer ones...
        // ...but force the newest (current living) generation to the very front.
        if (i === last) {
          m.position.z = 2;
        } else {
          m.position.z = (last - i) / (last || 1);
        }
      });
    }

    // Update store
    automataStore.updateGenerationInfo(
      automataManager.currentGenerationIndex,
      automataManager.totalGenerations,
      automataManager.generationHistorySize
    );

    automataStore.clearSeekTarget();
  });

  // Background color derived from cell state 0
  let bgColor = $derived(automataStore.hslString(automataStore.cellStates[0]?.color ?? { h: 360, s: 1, l: 1, a: 1 }));

  // Click-to-toggle play/pause (ignore drags for OrbitControls)
  let pointerDownPos: { x: number; y: number } | null = null;
  function handlePointerDown(e: PointerEvent) {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }
  function handlePointerUp(e: PointerEvent) {
    if (!pointerDownPos) return;
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    pointerDownPos = null;
    // Only toggle if it was a click, not a drag
    if (dx * dx + dy * dy < 9) {
      automataStore.togglePlay();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={containerEl}
  class="sticky top-0 z-0 h-full w-full overflow-hidden"
  style:background-color={bgColor}
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
></div>
