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
  let mounted = false;

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

    // Apply custom neighborhood radius
    if (automataStore.neighborhoodRadius > 1) {
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
    automataStore.getSeedSnapshot = () => {
      if (!automataManager) return null;
      const pop = automataManager.getPopulationAtIndex(0);
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
  }

  onMount(() => {
    mounted = true;
    initViewer(true);
    automataStore.play();
  });

  onDestroy(() => {
    mounted = false;
    automataStore.getPopulationAtIndex = null;
    automataStore.renderPreviewFrame = null;
    automataStore.getCanvasDataURL = null;
    automataStore.getSeedSnapshot = null;
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
      initViewer(true);
    }
  });

  // Watch for reset
  $effect(() => {
    const rc = automataStore.resetCounter;
    if (!mounted) return;
    if (trackedResetCounter !== undefined && rc !== trackedResetCounter) {
      initViewer(true);
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

  // Watch for neighborhood radius changes
  $effect(() => {
    const _neighbors = automataStore.neighbors;
    if (!automataManager) return;
    automataManager.neighbors = _neighbors;
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
      colorable.forEach((m: any, i: number) => {
        const color = new Color(`hsl(${h}, ${computedS}%, ${100 - (i + 5) * 1}%)`);
        m.material.color.set(color);
        m.position.z = 1 / (i + 1);
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
</script>

<div
  bind:this={containerEl}
  class="sticky top-0 z-0 h-full w-full overflow-hidden"
  style:background-color={bgColor}
></div>
