<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { encodeGif } from '$lib/utils/gif-encoder';
  import {
    AutomataManager,
    OneDimensionInTwoDimensions,
    TwoDimensionInTwoDimensions,
    TwoDimensionInThreeDimensions,
    ThreeDimensionInThreeDimensions,
  } from '$lib-core';

  let open = $derived(automataStore.gifStudioOpen);

  // Internal state
  let startMode: 'current' | 'seed' = $state('current');
  let frameCount = $state(20);
  let fps = $state(10);
  let frameDelay = $derived(Math.round(1000 / fps));
  let capturedFrames: ImageData[] = $state([]);
  let frameThumbnails: string[] = $state([]);
  let cropRect: { x: number; y: number; w: number; h: number } | null = $state(null);
  let isCapturing = $state(false);
  let isPlaying = $state(false);
  let openingSnapshot: Uint8Array | null = null;
  let markedStartSnapshot: Uint8Array | null = $state(null);
  let gifBlob: Blob | null = $state(null);
  let gifUrl: string | null = $state(null);
  let previewFrameIndex = $state(0);
  let studioGeneration = $state(0);
  let isEncoding = $state(false);
  let isPreviewPlaying = $state(false);

  let bgColor = $derived.by(() => {
    const states = automataStore.gifTargetConfig?.cellStates ?? automataStore.cellStates;
    return automataStore.hslString(states[0]?.color ?? { h: 360, s: 1, l: 1, a: 1 });
  });

  // Crop drag state
  let isCropping = $state(false);
  let cropStart: { x: number; y: number } | null = null;
  let pendingCropRect: { x: number; y: number; w: number; h: number } | null = $state(null);

  // DOM refs
  let viewerContainer: HTMLDivElement;
  let previewCanvas: HTMLCanvasElement;
  let timelineContainer: HTMLDivElement;
  let cropOverlayEl: HTMLDivElement;

  // Engine + viewer refs (not reactive)
  let engine: AutomataManager | undefined;
  let studioViewer: any = undefined;
  let previewTimer: ReturnType<typeof setInterval> | undefined;

  function getViewerClass(dim: number, viewer: number) {
    if (dim === 1 && viewer === 2) return OneDimensionInTwoDimensions;
    if (dim === 2 && viewer === 2) return TwoDimensionInTwoDimensions;
    if (dim === 2 && viewer === 3) return TwoDimensionInThreeDimensions;
    if (dim === 3 && viewer === 3) return ThreeDimensionInThreeDimensions;
    return TwoDimensionInTwoDimensions;
  }

  // Resolve config: use gifTargetConfig if set (from card), otherwise live store
  function cfg() {
    const t = automataStore.gifTargetConfig;
    return {
      dimension: t?.dimension ?? automataStore.dimension,
      viewer: t?.viewer ?? automataStore.viewer,
      rule: t?.rule ?? automataStore.rule,
      lattice: t?.lattice ?? automataStore.lattice,
      neighborhoodRadius: t?.neighborhoodRadius ?? automataStore.neighborhoodRadius,
      populationShape: t?.populationShape ?? automataStore.populationShape,
      cellStates: t?.cellStates ?? automataStore.cellStates,
      trailConfig: t?.trailConfig ?? automataStore.trailConfig,
      shapeRules: t?.shapeRules ?? automataStore.shapeRules,
      neighbors: automataStore.neighbors,
      seedPopulation: t?.seedPopulation ?? null,
    };
  }

  function createStudioEngine() {
    const c = cfg();
    const dim = c.dimension;
    const e = new AutomataManager();

    if (dim === 1) {
      if (c.neighborhoodRadius > 1) {
        e.useLifeLikeGenerator();
      } else {
        e.useOneDimensionGenerator();
      }
      e.generationHistorySize = 900;
      e.keyframeEveryGeneration = true;
    } else if (dim === 3) {
      e.useThreeDimensionGenerator();
      e.generationHistorySize = 150;
      e.seedDensity = 0.12;
    } else {
      e.useLifeLikeGenerator();
      e.generationHistorySize = 900;
    }

    e.populationShape = { ...c.populationShape };

    if (dim >= 2) {
      e.setLattice(c.lattice, c.neighborhoodRadius);
    } else if (c.neighborhoodRadius > 1) {
      e.neighbors = c.neighbors;
    }

    const rule = c.rule;
    if (rule.type === 'wolfram') {
      e.rule = rule.rule;
    } else {
      e.rule = { survive: rule.survive, born: rule.born };
    }
    if (c.shapeRules) {
      e.setShapeRules(c.shapeRules);
    }

    return e;
  }

  function loadPopulation() {
    if (!engine) return;
    const c = cfg();
    // Decode base64 seed from card item if available
    let cardSeed: Uint8Array | null = null;
    if (c.seedPopulation) {
      try {
        const bin = atob(c.seedPopulation);
        cardSeed = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) cardSeed[i] = bin.charCodeAt(i);
      } catch {}
    }
    // Use the snapshot captured at open time, falling back through cardSeed → savedSeed → random
    const snap = startMode === 'current'
      ? (openingSnapshot ?? cardSeed ?? automataStore.savedSeed)
      : (cardSeed ?? automataStore.savedSeed ?? openingSnapshot);
    if (snap) {
      engine.setSeedPopulation(snap);
    } else {
      engine.getSeedPopulation();
    }
    studioGeneration = 0;
  }

  function createStudioViewer() {
    if (studioViewer) {
      try { studioViewer.quit(); } catch (_e) {}
      studioViewer = undefined;
    }
    if (!viewerContainer || !engine) return;

    // Ensure container has real dimensions before Three.js reads them
    const rect = viewerContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const c = cfg();
    const dim = c.dimension;
    const view = c.viewer;

    const ViewerClass = getViewerClass(dim, view);
    studioViewer = new ViewerClass({
      containerEl: viewerContainer,
      populationShape: { ...c.populationShape },
      retrieveNextGeneration: () => {
        const pop = engine!.run();
        studioGeneration = engine!.absoluteGeneration;
        return pop;
      },
      latticeType: c.lattice,
    });

    studioViewer.states = c.cellStates;
    studioViewer.trailConfig = c.trailConfig;
    studioViewer.createScene();

    // Pre-fill for 1D
    if (dim === 1 && studioViewer.maxGenerationsToShow) {
      for (let i = 0; i < studioViewer.maxGenerationsToShow; i++) {
        studioViewer.addGeneration();
      }
    }

    // Add initial generation for 2D/3D so something is visible
    if (dim >= 2) {
      studioViewer.addGeneration();
      if (studioViewer.renderer && studioViewer.scene && studioViewer.camera) {
        studioViewer.renderer.render(studioViewer.scene, studioViewer.camera);
      }
    }

    return true;
  }

  async function initStudio() {
    // Capture snapshot once at open time so recaptures use the same state
    openingSnapshot = automataStore.getCurrentPopulationSnapshot?.() ?? null;

    engine = createStudioEngine();
    loadPopulation();

    // Poll until the container has real layout dimensions (up to 500ms)
    await tick();
    for (let i = 0; i < 20; i++) {
      await new Promise(r => requestAnimationFrame(r));
      if (viewerContainer && viewerContainer.clientWidth > 0 && viewerContainer.clientHeight > 0) break;
    }

    const ok = createStudioViewer();
    if (!ok) return;

    // Auto-mark start and capture frames
    if (engine && studioViewer) {
      markStart();
      await captureFramesAction();
      hasInitialized = true;
    }
  }

  function destroyStudio() {
    stopPreview();
    if (studioViewer) {
      try { studioViewer.quit(); } catch (_e) {}
      studioViewer = undefined;
    }
    engine = undefined;
    capturedFrames = [];
    frameThumbnails = [];
    openingSnapshot = null;
    markedStartSnapshot = null;
    cropRect = null;
    pendingCropRect = null;
    isPlaying = false;
    isCapturing = false;
    hasInitialized = false;
    studioGeneration = 0;
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      gifUrl = null;
    }
    gifBlob = null;
  }

  // Play/pause the studio viewer
  function toggleStudioPlay() {
    if (!studioViewer) return;
    isPlaying = !isPlaying;
    if (isPlaying) {
      studioViewer.turnSimulationOn();
    } else {
      studioViewer.turnSimulationOff();
    }
  }

  function stepForward() {
    if (!studioViewer) return;
    studioViewer.addGeneration();
    if (studioViewer.renderer && studioViewer.scene && studioViewer.camera) {
      studioViewer.renderer.render(studioViewer.scene, studioViewer.camera);
    }
  }

  function markStart() {
    if (!engine) return;
    const pop = engine.currentPopulation;
    if (!pop) return;
    markedStartSnapshot = engine._snapshotPopulation(pop);
  }

  function resetToMark() {
    if (!engine || !markedStartSnapshot || !studioViewer) return;
    isPlaying = false;
    studioViewer.turnSimulationOff();
    engine.setSeedPopulation(markedStartSnapshot);
    studioGeneration = 0;

    // Rebuild viewer
    studioViewer.clearGenerations();
    const dim = automataStore.dimension;
    if (dim === 1 && studioViewer.maxGenerationsToShow) {
      for (let i = 0; i < studioViewer.maxGenerationsToShow; i++) {
        studioViewer.addGeneration();
      }
    } else {
      studioViewer.addGeneration();
    }
    if (studioViewer.renderer && studioViewer.scene && studioViewer.camera) {
      studioViewer.renderer.render(studioViewer.scene, studioViewer.camera);
    }
  }

  async function captureFramesAction() {
    if (!engine || !studioViewer) return;
    isCapturing = true;

    // Stop playback
    isPlaying = false;
    studioViewer.turnSimulationOff();

    // Clear previous
    capturedFrames = [];
    frameThumbnails = [];
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      gifUrl = null;
    }
    gifBlob = null;

    // Reset to marked start if we have one
    if (markedStartSnapshot) {
      engine.setSeedPopulation(markedStartSnapshot);
      studioViewer.clearGenerations();
    }

    const newFrames: ImageData[] = [];
    const newThumbs: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      studioViewer.addGeneration();
      // Run trail removal + coloring (mirrors the normal animation loop)
      if (studioViewer.animateUpdateFn) {
        studioViewer.animateUpdateFn();
      }
      if (studioViewer.renderer && studioViewer.scene && studioViewer.camera) {
        studioViewer.renderer.render(studioViewer.scene, studioViewer.camera);
      }

      const source = studioViewer.renderer.domElement as HTMLCanvasElement;
      const canvas = document.createElement('canvas');

      const [sx, sy, sw, sh] = cropRect
        ? [cropRect.x, cropRect.y, cropRect.w, cropRect.h]
        : [0, 0, source.width, source.height];

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      // Fill with dead-cell background (Three.js renderer is transparent)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, sw, sh);
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

      newFrames.push(ctx.getImageData(0, 0, sw, sh));
      newThumbs.push(canvas.toDataURL('image/png'));
    }

    capturedFrames = newFrames;
    frameThumbnails = newThumbs;
    isCapturing = false;
    previewFrameIndex = 0;
    startPreview();
  }

  function startPreview() {
    stopPreview();
    if (frameThumbnails.length === 0) return;
    isPreviewPlaying = true;
    previewTimer = setInterval(() => {
      previewFrameIndex = (previewFrameIndex + 1) % frameThumbnails.length;
    }, frameDelay);
  }

  function stopPreview() {
    if (previewTimer !== undefined) {
      clearInterval(previewTimer);
      previewTimer = undefined;
    }
    isPreviewPlaying = false;
  }

  function togglePreview() {
    if (isPreviewPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  }

  function previewStepForward() {
    if (frameThumbnails.length === 0) return;
    stopPreview();
    previewFrameIndex = (previewFrameIndex + 1) % frameThumbnails.length;
  }

  function previewStepBackward() {
    if (frameThumbnails.length === 0) return;
    stopPreview();
    previewFrameIndex = (previewFrameIndex - 1 + frameThumbnails.length) % frameThumbnails.length;
  }

  async function encodeAndDownload() {
    if (capturedFrames.length === 0) return;
    isEncoding = true;
    await tick();

    // Defer to next frame so UI updates
    await new Promise(r => requestAnimationFrame(r));

    const { width, height } = capturedFrames[0];
    const blob = await encodeGif(capturedFrames, width, height, frameDelay);

    if (gifUrl) URL.revokeObjectURL(gifUrl);
    gifBlob = blob;
    gifUrl = URL.createObjectURL(blob);
    isEncoding = false;

    // Auto-download
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = 'automata.gif';
    a.click();
  }

  async function copyGif() {
    if (!gifBlob && capturedFrames.length > 0) {
      const { width, height } = capturedFrames[0];
      gifBlob = await encodeGif(capturedFrames, width, height, frameDelay);
      if (gifUrl) URL.revokeObjectURL(gifUrl);
      gifUrl = URL.createObjectURL(gifBlob);
    }
    if (!gifBlob) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/gif': gifBlob })
      ]);
    } catch {
      // Fallback: copy first frame as PNG
      if (frameThumbnails.length > 0) {
        const res = await fetch(frameThumbnails[0]);
        const pngBlob = await res.blob();
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ]);
        } catch {
          // Clipboard not supported
        }
      }
    }
  }

  // Crop overlay handlers
  function handleCropMouseDown(e: MouseEvent) {
    if (!cropOverlayEl) return;
    const rect = cropOverlayEl.getBoundingClientRect();
    cropStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    pendingCropRect = null;

    function handleCropMouseMove(e: MouseEvent) {
      if (!cropStart || !cropOverlayEl) return;
      const rect = cropOverlayEl.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const x = Math.min(cropStart.x, cx);
      const y = Math.min(cropStart.y, cy);
      const w = Math.abs(cx - cropStart.x);
      const h = Math.abs(cy - cropStart.y);
      pendingCropRect = { x, y, w, h };
    }

    function handleCropMouseUp() {
      window.removeEventListener('mousemove', handleCropMouseMove);
      window.removeEventListener('mouseup', handleCropMouseUp);

      if (pendingCropRect && pendingCropRect.w > 10 && pendingCropRect.h > 10) {
        // Convert from CSS pixels to canvas pixels
        if (studioViewer?.renderer?.domElement && cropOverlayEl) {
          const canvas = studioViewer.renderer.domElement as HTMLCanvasElement;
          const overlayRect = cropOverlayEl.getBoundingClientRect();
          const scaleX = canvas.width / overlayRect.width;
          const scaleY = canvas.height / overlayRect.height;
          cropRect = {
            x: Math.round(pendingCropRect.x * scaleX),
            y: Math.round(pendingCropRect.y * scaleY),
            w: Math.round(pendingCropRect.w * scaleX),
            h: Math.round(pendingCropRect.h * scaleY),
          };
        }
      }
      pendingCropRect = null;
      cropStart = null;
      isCropping = false;
    }

    window.addEventListener('mousemove', handleCropMouseMove);
    window.addEventListener('mouseup', handleCropMouseUp);
  }

  function clearCrop() {
    cropRect = null;
    pendingCropRect = null;
  }

  function closeStudio() {
    destroyStudio();
    automataStore.gifStudioOpen = false;
    automataStore.gifTargetConfig = null;
  }

  // Handle Escape key
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeStudio();
    }
  }

  // React to open state
  $effect(() => {
    if (open) {
      tick().then(() => initStudio());
    }
  });

  // Auto-recapture when settings change (debounced)
  let recaptureTimer: ReturnType<typeof setTimeout> | undefined;
  let hasInitialized = false;

  $effect(() => {
    // Track these values to trigger on change
    const _start = startMode;
    const _frames = frameCount;
    const _fps = fps;
    const _crop = cropRect;

    // Skip the initial run (initStudio handles that)
    if (!hasInitialized) return;
    if (!engine || !studioViewer) return;

    clearTimeout(recaptureTimer);
    recaptureTimer = setTimeout(async () => {
      // Reload population if start mode changed
      loadPopulation();
      markStart();
      await captureFramesAction();
    }, 500);
  });

  onDestroy(() => {
    clearTimeout(recaptureTimer);
    destroyStudio();
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="studio-backdrop" onclick={closeStudio}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="studio-modal" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="studio-header">
        <h2 class="studio-title">GIF Studio</h2>
        <span class="studio-gen">Gen {studioGeneration}</span>
        <button class="close-btn" onclick={closeStudio} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="M6 6 18 18" />
          </svg>
        </button>
      </div>

      <!-- Main content area -->
      <div class="studio-body">
        <!-- Left: Live Viewer -->
        <div class="viewer-section">
          <div class="viewer-wrapper">
            <div class="viewer-container" bind:this={viewerContainer} style:background-color={bgColor}></div>
            {#if isCropping}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="crop-overlay"
                bind:this={cropOverlayEl}
                onmousedown={handleCropMouseDown}
              >
                {#if pendingCropRect}
                  <div
                    class="crop-selection"
                    style="left:{pendingCropRect.x}px;top:{pendingCropRect.y}px;width:{pendingCropRect.w}px;height:{pendingCropRect.h}px"
                  ></div>
                {/if}
              </div>
            {/if}
            {#if cropRect}
              <div class="crop-badge">
                Crop: {cropRect.w}&times;{cropRect.h}
                <button class="crop-clear" onclick={clearCrop}>Clear</button>
              </div>
            {/if}
          </div>

          <!-- Viewer Controls -->
          <div class="viewer-controls">
            <button class="ctrl-btn" onclick={toggleStudioPlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {#if isPlaying}
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
              {/if}
            </button>
            <button class="ctrl-btn" onclick={stepForward} aria-label="Step forward" disabled={isPlaying}>
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="4,3 15,12 4,21" /><rect x="16" y="3" width="3" height="18" /></svg>
            </button>
            <button class="ctrl-btn mark-btn" class:marked={markedStartSnapshot !== null} onclick={markStart} aria-label="Mark start position">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" fill="currentColor" /></svg>
            </button>
            {#if markedStartSnapshot}
              <button class="ctrl-btn" onclick={resetToMark} aria-label="Reset to marked position">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              </button>
            {/if}
            <div class="ctrl-spacer"></div>
            <button class="ctrl-btn" class:active={isCropping} onclick={() => { isCropping = !isCropping; }} aria-label="Toggle crop mode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6.13 1 6 16a2 2 0 0 0 2 2h15" /><path d="M1 6.13 16 6a2 2 0 0 1 2 2v15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Right: Preview + Settings -->
        <div class="preview-section">
          <!-- GIF Preview -->
          <div class="preview-area">
            {#if gifUrl}
              <img class="preview-img" src={gifUrl} alt="GIF preview" />
            {:else if frameThumbnails.length > 0}
              <img class="preview-img" src={frameThumbnails[previewFrameIndex]} alt="Frame {previewFrameIndex + 1}" />
            {:else}
              <div class="preview-placeholder">
                <span>Capture frames to preview</span>
              </div>
            {/if}
          </div>

          <!-- Preview Controls -->
          {#if frameThumbnails.length > 0 && !gifUrl}
            <div class="preview-controls">
              <button class="ctrl-btn" onclick={previewStepBackward} disabled={isPreviewPlaying} aria-label="Previous frame">
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="3" height="18" /><polygon points="20,3 9,12 20,21" /></svg>
              </button>
              <button class="ctrl-btn" onclick={togglePreview} aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}>
                {#if isPreviewPlaying}
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                {:else}
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                {/if}
              </button>
              <button class="ctrl-btn" onclick={previewStepForward} disabled={isPreviewPlaying} aria-label="Next frame">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="4,3 15,12 4,21" /><rect x="16" y="3" width="3" height="18" /></svg>
              </button>
              <span class="preview-frame-info">{previewFrameIndex + 1} / {frameThumbnails.length}</span>
            </div>
          {/if}

          <!-- Settings -->
          <div class="settings-area">
            <div class="setting-row">
              <label class="setting-label">Start</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" bind:group={startMode} value="current" />
                  Current
                </label>
                <label class="radio-label">
                  <input type="radio" bind:group={startMode} value="seed" />
                  Seed
                </label>
              </div>
            </div>
            <div class="setting-row">
              <label class="setting-label" for="frame-count">Frames</label>
              <input id="frame-count" type="number" class="setting-input" bind:value={frameCount} min="2" max="200" />
              <span class="setting-limit">2–200</span>
            </div>
            <div class="setting-row">
              <label class="setting-label" for="fps">FPS</label>
              <input id="fps" type="number" class="setting-input" bind:value={fps} min="1" max="400" step="1" />
              <span class="setting-limit">1–400</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="export-actions">
            <button
              class="action-primary"
              onclick={captureFramesAction}
              disabled={isCapturing}
            >
              {#if isCapturing}
                Capturing...
              {:else}
                Capture {frameCount} Frames
              {/if}
            </button>
            <div class="export-row">
              <button
                class="action-secondary"
                onclick={encodeAndDownload}
                disabled={capturedFrames.length === 0 || isEncoding}
              >
                {isEncoding ? 'Encoding...' : 'Download GIF'}
              </button>
              <button
                class="action-secondary"
                onclick={copyGif}
                disabled={capturedFrames.length === 0}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Frame Timeline -->
      {#if frameThumbnails.length > 0}
        <div class="timeline-section">
          <div class="timeline-strip" bind:this={timelineContainer}>
            {#each frameThumbnails as thumb, i}
              <button
                class="timeline-frame"
                class:active={i === previewFrameIndex}
                onclick={() => { previewFrameIndex = i; }}
              >
                <img src={thumb} alt="Frame {i + 1}" />
                <span class="frame-num">{i + 1}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .studio-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .studio-modal {
    background: #1c1917;
    border: 2px solid #44403c;
    border-radius: 12px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    width: 95vw;
    max-width: 1100px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .studio-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #292524;
  }

  .studio-title {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #f5f5f4;
    letter-spacing: -0.02em;
  }

  .studio-gen {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #78716c;
  }

  .close-btn {
    margin-left: auto;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid #44403c;
    border-radius: 6px;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .close-btn:hover {
    border-color: #78716c;
    color: #f5f5f4;
  }

  .close-btn svg {
    width: 16px;
    height: 16px;
  }

  .studio-body {
    display: flex;
    gap: 20px;
    padding: 20px;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .viewer-section {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .viewer-wrapper {
    position: relative;
    flex: 1;
    min-height: 300px;
    border: 1px solid #292524;
    border-radius: 8px;
    overflow: hidden;
    background: #0c0a09;
  }

  .viewer-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .viewer-container :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  .crop-overlay {
    position: absolute;
    inset: 0;
    cursor: crosshair;
    z-index: 5;
  }

  .crop-selection {
    position: absolute;
    border: 3px dashed #facc15;
    outline: 2px solid rgba(0, 0, 0, 0.8);
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.8);
    background: rgba(250, 204, 21, 0.08);
    pointer-events: none;
  }

  .crop-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #facc15;
    background: rgba(28, 25, 23, 0.9);
    border: 1px solid #44403c;
    border-radius: 4px;
    padding: 3px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 4;
  }

  .crop-clear {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    background: none;
    border: 1px solid #44403c;
    border-radius: 3px;
    padding: 1px 6px;
    cursor: pointer;
    transition: color 0.15s;
  }

  .crop-clear:hover {
    color: #f5f5f4;
  }

  .viewer-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ctrl-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 6px;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }

  .ctrl-btn:hover:not(:disabled) {
    border-color: #78716c;
    color: #f5f5f4;
    background: #292524;
  }

  .ctrl-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .ctrl-btn.active {
    border-color: #facc15;
    color: #facc15;
  }

  .ctrl-btn.mark-btn.marked {
    border-color: #22c55e;
    color: #22c55e;
  }

  .ctrl-btn svg {
    width: 16px;
    height: 16px;
  }

  .ctrl-spacer {
    flex: 1;
  }

  .preview-section {
    flex: 0.8;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 250px;
  }

  .preview-area {
    border: 1px solid #292524;
    border-radius: 8px;
    background: #0c0a09;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .preview-img {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .preview-placeholder {
    color: #57534e;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    text-align: center;
    padding: 40px 20px;
  }

  .preview-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .preview-frame-info {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #78716c;
    margin-left: 4px;
  }

  .settings-area {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .setting-label {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #a8a29e;
    min-width: 72px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .setting-input {
    flex: 1;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #f5f5f4;
    background: #0c0a09;
    border: 1px solid #292524;
    border-radius: 4px;
    padding: 5px 8px;
    max-width: 100px;
    transition: border-color 0.15s;
  }

  .setting-input:focus {
    outline: none;
    border-color: #facc15;
  }

  .setting-limit {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
    white-space: nowrap;
  }

  .radio-group {
    display: flex;
    gap: 14px;
  }

  .radio-label {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #a8a29e;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .radio-label input[type="radio"] {
    accent-color: #facc15;
  }

  .export-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }

  .action-primary {
    width: 100%;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1c1917;
    background: #facc15;
    border: none;
    border-radius: 6px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }

  .action-primary:hover:not(:disabled) {
    background: #fbbf24;
  }

  .action-primary:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .export-row {
    display: flex;
    gap: 8px;
  }

  .action-secondary {
    flex: 1;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a8a29e;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .action-secondary:hover:not(:disabled) {
    border-color: #78716c;
    color: #f5f5f4;
  }

  .action-secondary:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Timeline */
  .timeline-section {
    border-top: 1px solid #292524;
    padding: 12px 20px;
  }

  .timeline-strip {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .timeline-strip::-webkit-scrollbar {
    height: 6px;
  }

  .timeline-strip::-webkit-scrollbar-track {
    background: #0c0a09;
    border-radius: 3px;
  }

  .timeline-strip::-webkit-scrollbar-thumb {
    background: #44403c;
    border-radius: 3px;
  }

  .timeline-frame {
    flex-shrink: 0;
    width: 60px;
    height: 48px;
    border: 2px solid #292524;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background: #0c0a09;
    padding: 0;
    transition: border-color 0.15s;
  }

  .timeline-frame:hover {
    border-color: #78716c;
  }

  .timeline-frame.active {
    border-color: #facc15;
  }

  .timeline-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: pixelated;
  }

  .frame-num {
    position: absolute;
    bottom: 1px;
    right: 3px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #78716c;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  @media (max-width: 768px) {
    .studio-body {
      flex-direction: column;
    }

    .preview-section {
      min-width: unset;
    }

    .viewer-wrapper {
      min-height: 200px;
    }
  }
</style>
