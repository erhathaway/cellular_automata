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
  let viewerDefaultUpdateRateMs: number | undefined;

  // Generation view tracking (debounced)
  let viewTrackTimer: ReturnType<typeof setTimeout> | null = null;

  function trackGenerationView() {
    if (viewTrackTimer !== null) clearTimeout(viewTrackTimer);
    viewTrackTimer = setTimeout(async () => {
      viewTrackTimer = null;
      try {
        const rule = automataStore.rule;
        let ruleDefinition: string;
        if (rule.type === 'wolfram') {
          ruleDefinition = `W${rule.rule}`;
        } else {
          ruleDefinition = `B${rule.born.join(',')}S${rule.survive.join(',')}`;
        }
        await fetch('/api/generation-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latticeType: automataStore.lattice,
            ruleDefinition,
            dimension: automataStore.dimension,
            neighborhoodRadius: automataStore.neighborhoodRadius,
          }),
        });
      } catch {
        // ignore — fire and forget
      }
    }, 2000);
  }

  // Defer initViewer to a new browser task so click handlers complete quickly.
  // Immediately tears down the old viewer and updates tracked values to prevent
  // double-firing, then schedules the heavy init work.
  function scheduleInit(shouldRun = false) {
    // Update tracked values now to prevent effects from re-firing
    trackedDimension = automataStore.dimension;
    trackedViewer = automataStore.viewer;
    trackedResetCounter = automataStore.resetCounter;
    trackedLattice = automataStore.lattice;
    // Stop the animation immediately so no frames run on the stale automataManager
    // (e.g. a wolfram rule set on a LifeLike ruleApplicator during a radius change)
    if (viewer) {
      try { viewer.turnSimulationOff(); } catch (_e) {}
    }
    // Debounce: if multiple effects trigger in the same flush, only one init runs
    if (pendingInit !== null) clearTimeout(pendingInit);
    pendingInit = setTimeout(() => {
      pendingInit = null;
      initViewer(shouldRun);
    }, 0);
  }

  function retrieveNextGeneration() {
    const pop = automataManager!.run();
    automataStore.observePopulationForIntervention(pop);
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
      automataManager.generationHistorySize = 900;
      viewer = new OneDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 2) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 900;
      viewer = new TwoDimensionInTwoDimensions(viewerConfig);
    } else if (dim === 2 && view === 3) {
      automataManager.useLifeLikeGenerator();
      automataManager.generationHistorySize = 450;
      viewer = new TwoDimensionInThreeDimensions(viewerConfig);
    } else if (dim === 3 && view === 3) {
      automataManager.useThreeDimensionGenerator();
      automataManager.generationHistorySize = 150;
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
      const pop = automataManager.currentPopulation;
      if (!pop) return null;
      return automataManager._snapshotPopulation(pop);
    };

    // Snapshot cell states + trail config for preview rendering
    automataStore.previewCellStates = [...automataStore.cellStates];
    automataStore.previewTrailConfig = { ...automataStore.trailConfig };

    if (viewer) {
      // Set cell state colors + trail config
      viewer.states = automataStore.cellStates;
      viewer.trailConfig = automataStore.trailConfig;

      // Set rule on automata manager
      setRule();

      // Create Three.js scene
      viewer.createScene();
      viewerDefaultUpdateRateMs = viewer.updateRateInMS;

      // Create genesis population
      automataManager!.populationShape = shape;
      if (automataStore.savedSeed && automataStore.useSavedSeed) {
        automataManager!.setSeedPopulation(automataStore.savedSeed);
        // Skip the initial fast ramp — start at post-100 generation speed
        if (!viewer.updateRateInMS) {
          viewer.updateRateInMS = 100;
          viewerDefaultUpdateRateMs = 100;
        }
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

        // Remove excess meshes and apply trail coloring
        const trailSize = automataStore.trailConfig.size;
        while (viewer.meshes.length > trailSize) {
          const mesh = viewer.meshes[0];
          viewer.cleanUpRefsByMesh(mesh, true);
        }
        // Apply trail gradient to remaining meshes
        if (dim === 2 && view === 2) {
          const tc = automataStore.trailConfig;
          const deadHSL = viewer._states[0] || { h: 0, s: 1, l: 1 };
          const trailH = tc.color.h;
          const trailS = tc.color.s * 100;
          const trailL = tc.color.l * 100;
          const deadH = deadHSL.h;
          const deadS = deadHSL.s * 100;
          const deadL = deadHSL.l * 100;
          const last = viewer.meshes.length - 1;
          viewer.meshes.forEach((m: any, i: number) => {
            const mat = m.material;
            if (!mat) return;
            if (i === last) {
              mat.color.set(new Color(0x000000));
            } else {
              const tRaw = last > 1 ? i / (last - 1) : 0;
              const h = Math.floor(deadH + tRaw * (trailH - deadH));
              const s = Math.floor(deadS + tRaw * (trailS - deadS));
              const l = Math.floor(deadL + tRaw * (trailL - deadL));
              mat.color.set(new Color(`hsl(${h}, ${s}%, ${l}%)`));
            }
            m.position.z = i === last ? 2 : i / (last || 1);
          });
        }
      }

      // Start simulation
      if (shouldRun || automataStore.isPlaying) {
        viewer.turnSimulationOn();
      }

      // Track this config view (debounced, fire-and-forget)
      trackGenerationView();
    }

    trackedDimension = dim;
    trackedViewer = view;
    trackedResetCounter = automataStore.resetCounter;
    trackedLattice = automataStore.lattice;
  }

  onMount(() => {
    mounted = true;
    // If store is already hydrated (PersistenceManager ran first), init immediately.
    // Otherwise the $effect below will catch it once hydration completes.
    if (automataStore.hydrated) {
      initViewer(true);
      automataStore.play();
    }
  });

  // Wait for persistence hydration before initializing the viewer.
  // Svelte mounts children before siblings, so ViewPlayer.onMount can fire
  // before PersistenceManager.onMount — this effect handles that case.
  $effect(() => {
    const hydrated = automataStore.hydrated;
    if (!mounted || !hydrated || viewer) return;
    initViewer(true);
    automataStore.play();
  });

  onDestroy(() => {
    mounted = false;
    if (pendingInit !== null) {
      clearTimeout(pendingInit);
      pendingInit = null;
    }
    if (viewTrackTimer !== null) {
      clearTimeout(viewTrackTimer);
      viewTrackTimer = null;
    }
    automataStore.getPopulationAtIndex = null;
    automataStore.renderPreviewFrame = null;
    automataStore.getCanvasDataURL = null;
    automataStore.captureThumbnail = null;
    automataStore.getSeedSnapshot = null;
    automataStore.getCurrentPopulationSnapshot = null;
    automataStore.previewCellStates = null;
    automataStore.previewTrailConfig = null;
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

  // Watch for intervention update-rate overrides
  $effect(() => {
    const interventionRate = automataStore.interventionUpdateRateMs;
    if (!viewer) return;

    if (interventionRate !== null) {
      viewer.updateRateInMS = interventionRate;
      return;
    }

    viewer.updateRateInMS = viewerDefaultUpdateRateMs;
  });

  // Watch for cell state color changes
  $effect(() => {
    const states = automataStore.cellStates;
    if (!viewer) return;
    viewer.states = states;
    automataStore.previewCellStates = [...states];
  });

  // Watch for trail config changes
  $effect(() => {
    const tc = automataStore.trailConfig;
    if (!viewer) return;
    viewer.trailConfig = tc;
    automataStore.previewTrailConfig = { ...tc };
  });

  // Watch for shape changes (without reinitializing viewer)
  $effect(() => {
    const shape = automataStore.populationShape;
    if (!automataManager) return;
    // Only push same-dimensionality changes — dimension switches trigger full reinit
    const curKeys = Object.keys(automataManager.populationShape).sort().join();
    const newKeys = Object.keys(shape).sort().join();
    if (curKeys !== newKeys) return;
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
      // setLattice rebuilds per-shape lookups from lattice defaults —
      // re-apply custom shape rules so they aren't lost.
      const sr = automataStore.shapeRules;
      if (sr) automataManager.setShapeRules(sr);
    } else {
      automataManager.neighbors = _neighbors;
    }
  });

  // Watch for seek target
  $effect(() => {
    const target = automataStore.seekTarget;
    if (target === null || !automataManager || !viewer) return;

    // Determine trail size based on trail config or viewer type
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    let trailSize = 1;
    if (dim === 2 && view === 2) trailSize = automataStore.trailConfig.size;
    else if (dim === 2 && view === 3) trailSize = automataStore.trailConfig.size;
    else if (dim === 1 && view === 2) trailSize = viewer.maxGenerationsToShow || 100;

    // Pause the animation loop during seek to prevent races with rAF
    const wasRunning = viewer.runSimulation;
    viewer.runSimulation = false;

    // Seek automata manager to a position that allows trail preloading
    const seekStart = Math.max(0, target - trailSize);
    automataManager.seekTo(seekStart);

    // Clear all viewer meshes (clearGenerations resets updateRateInMS — restore it)
    const savedRate = viewer.updateRateInMS ?? viewerDefaultUpdateRateMs ?? 100;
    viewer.clearGenerations();
    viewer.updateRateInMS = savedRate;

    // Preload trail by stepping through history
    const steps = target - seekStart;
    for (let i = 0; i < steps; i++) {
      viewer.addGeneration();
    }

    // Ensure automata is at target (1D guard can block some addGeneration calls)
    automataManager.seekTo(target);

    // Reset animation timer so next frame respects the rate delay
    viewer.updateStartTime = new Date().getTime();

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
      const tc = automataStore.trailConfig;
      const colorable = viewer.meshes.slice(-tc.size);
      const deadState = automataStore.cellStates.find((s: any) => s.role === 'dead');
      const deadH = deadState?.color.h ?? 0;
      const deadS = (deadState?.color.s ?? 1) * 100;
      const deadL = (deadState?.color.l ?? 1) * 100;
      const trailH = tc.color.h;
      const trailS = tc.color.s * 100;
      const trailL = tc.color.l * 100;
      const last = colorable.length - 1;
      colorable.forEach((m: any, i: number) => {
        if (i === last) {
          m.material.color.set(new Color(0x000000));
        } else {
          const tRaw = last > 1 ? i / (last - 1) : 0;
          let t: number;
          if (tc.stepFn === 'exponential') t = tRaw * tRaw;
          else if (tc.stepFn === 'none') t = 1;
          else t = tRaw;
          const h = Math.floor(deadH + t * (trailH - deadH));
          const s = Math.floor(deadS + t * (trailS - deadS));
          const l = Math.floor(deadL + t * (trailL - deadL));
          m.material.color.set(new Color(`hsl(${h}, ${s}%, ${l}%)`));
        }
        if (i === last) {
          m.position.z = 2;
        } else {
          m.position.z = i / (last || 1);
        }
      });
    }

    // Update store
    automataStore.updateGenerationInfo(
      automataManager.currentGenerationIndex,
      automataManager.totalGenerations,
      automataManager.generationHistorySize
    );

    // Restore simulation state
    viewer.runSimulation = wasRunning;

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
