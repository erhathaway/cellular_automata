<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';


  // Auto-hide controls
  let controlsVisible = $state(false);
  let fadeTimer: ReturnType<typeof setTimeout> | null = null;
  const FADE_DELAY = 3000;

  function showControls() {
    controlsVisible = true;
    resetFadeTimer();
  }

  function resetFadeTimer() {
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      // Don't hide if dragging the progress bar
      if (!isDragging) {
        controlsVisible = false;
      }
    }, FADE_DELAY);
  }

  function handleParentMouseEnter() {
    showControls();
  }

  function handleParentMouseLeave() {
    if (!isDragging) {
      controlsVisible = false;
      if (fadeTimer) clearTimeout(fadeTimer);
    }
  }

  function handleParentMouseMove() {
    showControls();
  }

  function handleParentClick() {
    showControls();
  }


  let progressBarEl: HTMLElement;
  let previewCanvas: HTMLCanvasElement = $state(undefined as any);
  let isDragging = $state(false);
  let wasPlayingBeforeDrag = false;
  let isHovering = $state(false);
  let hoverX = $state(0);
  let hoveredIndexRaw = $state(-1);
  let barWidth = $state(0);

  // Clamp hoveredIndex to current keyframe bounds so it never goes stale
  let hoveredIndex = $derived(
    hoveredIndexRaw < 0
      ? -1
      : Math.min(hoveredIndexRaw, Math.max(0, automataStore.keyframeCount - 1))
  );

  let progressPercent = $derived(
    automataStore.keyframeCount > 1
      ? (automataStore.currentKeyframeIndex / (automataStore.keyframeCount - 1)) * 100
      : 0
  );

  // Always use the 2D-2D blue for the progress bar
  const fillColor = 'hsl(234, 70%, 40%)';

  let active = $derived(isHovering || isDragging);

  function getSeekIndexFromEvent(e: MouseEvent) {
    if (!progressBarEl) return 0;
    const rect = progressBarEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.min(
      Math.round(ratio * (automataStore.keyframeCount - 1)),
      automataStore.keyframeCount - 1
    );
  }

  function updateHoverFromEvent(e: MouseEvent) {
    if (!progressBarEl) return;
    const rect = progressBarEl.getBoundingClientRect();
    hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    barWidth = rect.width;
    const kfCount = automataStore.keyframeCount;
    if (kfCount <= 1) {
      hoveredIndexRaw = 0;
      return;
    }
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hoveredIndexRaw = Math.min(
      Math.round(ratio * (kfCount - 1)),
      kfCount - 1
    );
    // Snap hoverX to keyframe position
    hoverX = (hoveredIndex / (kfCount - 1)) * rect.width;
  }

  function handleMouseDown(e: MouseEvent) {
    if (automataStore.keyframeCount <= 1) return;
    isDragging = true;
    wasPlayingBeforeDrag = automataStore.isPlaying;
    if (wasPlayingBeforeDrag) automataStore.pause();
    const index = getSeekIndexFromEvent(e);
    automataStore.seekToKeyframe(index);
  }

  function handleWindowMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const index = getSeekIndexFromEvent(e);
    automataStore.seekToKeyframe(index);
    updateHoverFromEvent(e);
    schedulePreviewRender();
  }

  function handleWindowMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (wasPlayingBeforeDrag) automataStore.play();
  }

  function handleBarMouseEnter() {
    isHovering = true;
  }

  function handleBarMouseMove(e: MouseEvent) {
    isHovering = true;
    if (automataStore.keyframeCount <= 1) return;
    updateHoverFromEvent(e);
    schedulePreviewRender();
  }

  function handleBarMouseLeave() {
    if (!isDragging) {
      isHovering = false;
      hoveredIndexRaw = -1;
    }
  }

  let pendingFrame = 0;
  function schedulePreviewRender() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      renderPreview();
      // While hovering and playing, keep re-rendering so the preview tracks the live simulation
      if (showCanvas && automataStore.isPlaying && hoveredIndex >= 0) {
        schedulePreviewRender();
      }
    });
  }

  // Re-render preview whenever the tooltip becomes visible or the hovered index changes
  $effect(() => {
    // Read reactive deps
    const visible = showCanvas;
    const idx = hoveredIndex;
    clearPreviewCanvas();  // Prevent stale image flash
    if (visible && idx >= 0) {
      schedulePreviewRender();
    }
  });

  function clearPreviewCanvas() {
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  }

  function renderPreview() {
    if (!previewCanvas || hoveredIndex < 0 || !automataStore.getKeyframePopulation) {
      clearPreviewCanvas();
      return;
    }
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    if (view === 3) renderPreview3D();
    else if (dim === 2) renderPreview2D();
    else if (dim === 1) renderPreview1D();
  }

  function renderPreview3D() {
    const getPopAt = automataStore.getKeyframePopulation;
    if (!getPopAt) return;
    const idx = hoveredIndex;
    if (idx < 0) return;

    const pop = getPopAt(idx);
    if (!pop) return;
    // Set canvas to display size for WebGL rendering
    previewCanvas.width = previewDisplaySize.width;
    previewCanvas.height = previewDisplaySize.height;
    automataStore.renderPreviewFrame?.([pop], previewCanvas);
  }

  function renderPreview2D() {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const getPopAt = automataStore.getKeyframePopulation;
    if (!getPopAt) return;
    const idx = hoveredIndex;
    if (idx < 0) return;

    const states = automataStore.previewCellStates ?? automataStore.cellStates;
    const deadState = states.find((s: any) => s.role === 'dead');
    const bg = deadState?.color ?? { h: 0, s: 1, l: 1, a: 1 };
    const shape = automataStore.populationShape;
    const w = shape.x ?? 1;
    const h = shape.y ?? 1;

    const tc = automataStore.previewTrailConfig ?? automataStore.trailConfig;
    const trailSize = Math.min(tc.size, idx + 1);
    const startIdx = idx - trailSize + 1;

    // Collect trail populations (oldest first)
    const pops: (number[][] | null)[] = [];
    for (let i = startIdx; i <= idx; i++) {
      pops.push(getPopAt(i) as number[][] | null);
    }

    previewCanvas.width = w;
    previewCanvas.height = h;
    ctx.fillStyle = automataStore.hslString(bg);
    ctx.fillRect(0, 0, w, h);

    const deadH = bg.h;
    const deadS = bg.s * 100;
    const deadL = bg.l * 100;
    const trailH = tc.color.h;
    const trailS = tc.color.s * 100;
    const trailL = tc.color.l * 100;
    const last = pops.length - 1;

    for (let layer = 0; layer <= last; layer++) {
      const pop = pops[layer];
      if (!pop) continue;

      let fillColor: string;
      if (layer === last) {
        fillColor = 'hsl(0, 0%, 0%)';
      } else {
        const tRaw = last > 1 ? layer / (last - 1) : 0;
        let t: number;
        if (tc.stepFn === 'exponential') t = tRaw * tRaw;
        else if (tc.stepFn === 'none') t = 1;
        else t = tRaw;
        const ch = Math.floor(deadH + t * (trailH - deadH));
        const cs = Math.floor(deadS + t * (trailS - deadS));
        const cl = Math.floor(deadL + t * (trailL - deadL));
        fillColor = `hsl(${ch}, ${cs}%, ${cl}%)`;
      }

      ctx.fillStyle = fillColor;
      for (let x = 0; x < w; x++) {
        const col = pop[x];
        if (!col) continue;
        for (let y = 0; y < h; y++) {
          if (col[y] === 1) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  function renderPreview1D() {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const getPopAt = automataStore.getKeyframePopulation;
    if (!getPopAt) return;
    const idx = hoveredIndex;
    if (idx < 0) return;

    const states = automataStore.previewCellStates ?? automataStore.cellStates;
    const bg = states[0]?.color;
    const fg = states[1]?.color;

    // Show the most recent rows up to the hovered index, capped to population width for ~square aspect
    const w = automataStore.populationShape.x ?? 1;
    const maxRows = w;
    const startIdx = Math.max(0, idx - maxRows + 1);
    const rows: number[][] = [];
    for (let i = startIdx; i <= idx; i++) {
      const pop = getPopAt(i) as number[] | null;
      if (pop) rows.push(pop);
    }
    if (rows.length === 0) return;

    const h = rows.length;

    previewCanvas.width = w;
    previewCanvas.height = h;
    ctx.fillStyle = automataStore.hslString(bg);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = automataStore.hslString(fg);

    for (let y = 0; y < h; y++) {
      const cells = rows[y];
      for (let x = 0; x < w; x++) {
        if (cells[x] === 1) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  let previewScale = $derived(barWidth > 800 ? 3 : 2);

  let tooltipLeft = $derived.by(() => {
    const tooltipWidth = 160 * previewScale + 8;
    const half = tooltipWidth / 2;
    if (barWidth <= 0) return hoverX;
    return Math.max(half, Math.min(barWidth - half, hoverX));
  });

  let previewDisplaySize = $derived.by(() => {
    const dim = automataStore.dimension;
    const shape = automataStore.populationShape;
    const maxW = 160 * previewScale;
    if (dim === 2) {
      const w = shape.x ?? 1;
      const h = shape.y ?? 1;
      const scale = maxW / w;
      return { width: maxW, height: Math.round(h * scale) };
    }
    if (dim === 1) {
      return { width: maxW, height: maxW };
    }
    if (dim === 3) {
      return { width: maxW, height: maxW };
    }
    return { width: 0, height: 0 };
  });

  let showTooltip = $derived(
    active && hoveredIndex >= 0 && automataStore.keyframeCount > 1
  );

  let showCanvas = $derived(showTooltip && !!automataStore.getKeyframePopulation);

  let asideEl: HTMLElement;
  let isFullscreen = $state(false);

  function toggleFullscreen() {
    const section = asideEl?.closest('section');
    if (!section) return;
    if (!document.fullscreenElement) {
      section.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Attach hover/click listeners to the parent viewer section
    const parentSection = asideEl?.closest('section');
    if (parentSection) {
      parentSection.addEventListener('mouseenter', handleParentMouseEnter);
      parentSection.addEventListener('mouseleave', handleParentMouseLeave);
      parentSection.addEventListener('mousemove', handleParentMouseMove);
      parentSection.addEventListener('click', handleParentClick);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (parentSection) {
        parentSection.removeEventListener('mouseenter', handleParentMouseEnter);
        parentSection.removeEventListener('mouseleave', handleParentMouseLeave);
        parentSection.removeEventListener('mousemove', handleParentMouseMove);
        parentSection.removeEventListener('click', handleParentClick);
      }
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  });
</script>

<aside
  bind:this={asideEl}
  class="absolute z-20 transition-opacity duration-500"
  style="bottom: 20px; left: 20px; right: 20px; height: 76px; opacity: {controlsVisible ? 1 : 0}; pointer-events: {controlsVisible ? 'auto' : 'none'};"
>
  <!-- Progress Bar Hit Area -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={progressBarEl}
    class="absolute top-0 w-full cursor-pointer"
    style="height: 20px;"
    onmousedown={handleMouseDown}
    onmouseenter={handleBarMouseEnter}
    onmousemove={handleBarMouseMove}
    onmouseleave={handleBarMouseLeave}
  >
    <!-- Preview Tooltip -->
    {#if showTooltip}
      <div
        style="position: absolute; bottom: 100%; left: {tooltipLeft}px; transform: translateX(-50%); margin-bottom: 8px; pointer-events: none; z-index: 10;"
      >
        <div
          style="background: rgba(0,0,0,0.85); border-radius: 4px; padding: 6px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
        >
          {#if showCanvas}
            {#if automataStore.dimension === 1}
              <canvas
                bind:this={previewCanvas}
                style="width: {previewDisplaySize.width}px; height: {previewDisplaySize.height}px; image-rendering: pixelated; border-radius: 2px;"
              ></canvas>
            {:else}
              <div style="width: {previewDisplaySize.width}px; height: {previewDisplaySize.height}px; overflow: hidden; border-radius: 2px;">
                <canvas
                  bind:this={previewCanvas}
                  style="width: {previewDisplaySize.width * 2}px; height: {previewDisplaySize.height * 2}px; margin-left: -{previewDisplaySize.width / 2}px; margin-top: -{previewDisplaySize.height / 2}px; {automataStore.viewer === 3 ? '' : 'image-rendering: pixelated;'}"
                ></canvas>
              </div>
            {/if}
          {/if}
          <span
            style="color: rgba(255,255,255,0.8); font-size: 11px; margin-top: {showCanvas ? 4 : 0}px; font-family: monospace; white-space: nowrap;"
          >Gen {automataStore.getKeyframeGeneration?.(hoveredIndex) ?? hoveredIndex}</span>
        </div>
      </div>
    {/if}

    <!-- Bar Track -->
    <div
      style="position: absolute; top: 50%; left: 0; right: 0; height: {active ? 8 : 6}px; transform: translateY(-50%); background: black; border-radius: 4px; transition: height 0.15s ease; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.1);"
    >
      <!-- Progress Fill -->
      <div
        style="height: 100%; width: {progressPercent}%; background-color: {fillColor}; border-radius: 4px 0 0 4px;"
      ></div>
    </div>

    <!-- Handle -->
    {#if automataStore.keyframeCount > 1}
      <div
        style="position: absolute; top: 50%; left: {progressPercent}%; transform: translate(-50%, -50%); width: 18px; height: 18px; background-color: black; border-radius: 50%; pointer-events: none; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"
      ></div>
    {/if}
  </div>

  <!-- Replay buttons (above progress bar, only when saved seed exists) -->
  {#if automataStore.savedSeed}
    <div class="absolute flex items-center gap-2" style="bottom: calc(100% + 8px); left: 0;">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="flex cursor-pointer items-center gap-2"
        style="height: 38px; padding: 0 14px; border-radius: 19px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); font-size: 13px; white-space: nowrap;"
        onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
        onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
        onclick={() => { automataStore.useSavedSeed = true; automataStore.reset(); }}
      >
        <!-- Replay arrow icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Replay with claimed seed
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="flex cursor-pointer items-center gap-2"
        style="height: 38px; padding: 0 14px; border-radius: 19px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); font-size: 13px; white-space: nowrap;"
        onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
        onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
        onclick={() => { automataStore.useSavedSeed = false; automataStore.reset(); }}
      >
        <!-- Shuffle icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
        Replay with random seed
      </div>
    </div>
  {/if}

  <!-- Buttons Row -->
  <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <!-- Play Button -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="flex cursor-pointer items-center justify-center"
        style="height: 44px; width: 44px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
        onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.85)'; }}
        onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.7)'; }}
        onclick={() => automataStore.togglePlay()}
      >
        {#if automataStore.isPlaying}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" style="height: 20px; width: 20px;">
            <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" style="height: 20px; width: 20px;">
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
          </svg>
        {/if}
      </div>

      {#if !automataStore.savedSeed}
        <!-- Reset Button -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="flex cursor-pointer items-center justify-center"
          style="height: 44px; width: 44px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
          onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
          onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
          onclick={() => automataStore.reset()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        </div>
      {/if}
    </div>

    <!-- Fullscreen Button -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="flex cursor-pointer items-center justify-center"
      style="height: 44px; width: 44px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
      onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.85)'; }}
      onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.7)'; }}
      onclick={toggleFullscreen}
    >
      {#if isFullscreen}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="height: 18px; width: 18px;">
          <polyline points="4 14 10 14 10 20"/>
          <polyline points="20 10 14 10 14 4"/>
          <line x1="14" y1="10" x2="21" y2="3"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="height: 18px; width: 18px;">
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      {/if}
    </div>
  </div>
</aside>

<style>
  :global(section:fullscreen) {
    border: none !important;
    border-radius: 0 !important;
    background: #000;
  }
</style>

