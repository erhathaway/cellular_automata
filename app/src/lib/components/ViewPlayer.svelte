<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
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
    return automataManager!.run();
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
      automataManager.useOneDimensionGenerator();
      automataManager.generationHistorySize = 1500;
      viewer = new OneDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 2) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 2;
      viewer = new TwoDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 3) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 20;
      viewer = new TwoDimensionInThreeDimensions(viewerConfig);
    } else if (dim === 3 && view === 3) {
      automataManager.useThreeDimensionGenerator();
      automataManager.generationHistorySize = 20;
      viewer = new ThreeDimensionInThreeDimensions(viewerConfig);
    }

    if (viewer) {
      // Set cell state colors
      viewer.states = automataStore.cellStates;

      // Set rule on automata manager
      setRule();

      // Create Three.js scene
      viewer.createScene();

      // Create genesis population
      automataManager!.populationShape = shape;
      automataManager!.getSeedPopulation();

      // Pre-fill for 1D viewer
      if (dim === 1 && viewer.maxGenerationsToShow) {
        for (let i = 0; i < viewer.maxGenerationsToShow * 2; i++) {
          viewer.addGeneration();
        }
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

  // Background color derived from cell state 0
  let bgColor = $derived(automataStore.hslString(automataStore.cellStates[0]?.color ?? { h: 360, s: 1, l: 1, a: 1 }));
</script>

<div
  bind:this={containerEl}
  class="fixed inset-0 z-0 overflow-hidden"
  style:background-color={bgColor}
></div>
