<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { SignedIn } from 'svelte-clerk/client';
  import SaveDialog from './SaveDialog.svelte';
  import { api } from '$lib/api';

  let saveDialogOpen = $state(false);
  let savedEntityId: string | null = $state(null);
  let savedEntityType: 'generation_run' | 'cell_population' | null = $state(null);
  let isLiked = $state(false);
  let isBookmarked = $state(false);
  let likeCount = $state(0);

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
      // Don't hide if dragging the progress bar or save dialog is open
      if (!isDragging && !saveDialogOpen) {
        controlsVisible = false;
      }
    }, FADE_DELAY);
  }

  function handleParentMouseEnter() {
    showControls();
  }

  function handleParentMouseLeave() {
    if (!isDragging && !saveDialogOpen) {
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

  function handleSaved(info: { id: string; entityType: 'generation_run' | 'cell_population' }) {
    savedEntityId = info.id;
    savedEntityType = info.entityType;
    isLiked = false;
    isBookmarked = false;
    likeCount = 0;
  }

  async function toggleLike() {
    if (!savedEntityId || !savedEntityType) return;
    const body = savedEntityType === 'generation_run'
      ? { generationRunId: savedEntityId }
      : { cellPopulationId: savedEntityId };
    if (isLiked) {
      isLiked = false;
      likeCount = Math.max(0, likeCount - 1);
      try {
        await api('DELETE', '/api/likes', body);
      } catch {
        isLiked = true;
        likeCount++;
      }
    } else {
      isLiked = true;
      likeCount++;
      try {
        await api('POST', '/api/likes', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          isLiked = false;
          likeCount = Math.max(0, likeCount - 1);
        }
      }
    }
  }

  async function toggleBookmark() {
    if (!savedEntityId || !savedEntityType) return;
    const body = savedEntityType === 'generation_run'
      ? { generationRunId: savedEntityId }
      : { cellPopulationId: savedEntityId };
    if (isBookmarked) {
      isBookmarked = false;
      try {
        await api('DELETE', '/api/bookmarks', body);
      } catch {
        isBookmarked = true;
      }
    } else {
      isBookmarked = true;
      try {
        await api('POST', '/api/bookmarks', body);
      } catch (err: any) {
        if (!err.message?.startsWith('409')) {
          isBookmarked = false;
        }
      }
    }
  }

  let progressBarEl: HTMLElement;
  let previewCanvas: HTMLCanvasElement = $state(undefined as any);
  let isDragging = $state(false);
  let wasPlayingBeforeDrag = false;
  let isHovering = $state(false);
  let hoverX = $state(0);
  let hoveredIndex = $state(-1);
  let barWidth = $state(0);

  let progressPercent = $derived(
    automataStore.historyCapacity > 1
      ? (automataStore.generationIndex / (automataStore.historyCapacity - 1)) * 100
      : 0
  );

  // Always use the 2D-2D blue for the progress bar
  const fillColor = 'hsl(234, 70%, 40%)';

  let active = $derived(isHovering || isDragging);

  function getSeekIndexFromEvent(e: MouseEvent) {
    if (!progressBarEl) return 0;
    const rect = progressBarEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawIndex = Math.round(ratio * (automataStore.historyCapacity - 1));
    // Clamp to computed range — don't allow seeking into uncomputed (black) region
    return Math.min(rawIndex, Math.max(0, automataStore.totalGenerations - 1));
  }

  function updateHoverFromEvent(e: MouseEvent) {
    if (!progressBarEl) return;
    const rect = progressBarEl.getBoundingClientRect();
    hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    barWidth = rect.width;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawIndex = Math.round(ratio * (automataStore.historyCapacity - 1));
    // Clamp to computed range
    hoveredIndex = Math.min(rawIndex, Math.max(0, automataStore.totalGenerations - 1));
    // Snap hoverX to clamped index position so tooltip doesn't float over the black region
    if (automataStore.historyCapacity > 1) {
      hoverX = (hoveredIndex / (automataStore.historyCapacity - 1)) * rect.width;
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (automataStore.totalGenerations <= 1) return;
    isDragging = true;
    wasPlayingBeforeDrag = automataStore.isPlaying;
    if (wasPlayingBeforeDrag) automataStore.pause();
    const index = getSeekIndexFromEvent(e);
    automataStore.seekTo(index);
  }

  function handleWindowMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const index = getSeekIndexFromEvent(e);
    automataStore.seekTo(index);
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
    if (automataStore.totalGenerations <= 1) return;
    updateHoverFromEvent(e);
    schedulePreviewRender();
  }

  function handleBarMouseLeave() {
    if (!isDragging) {
      isHovering = false;
      hoveredIndex = -1;
    }
  }

  let pendingFrame = 0;
  function schedulePreviewRender() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      renderPreview();
    });
  }

  const PREVIEW_TRAIL_1D = 100;
  const PREVIEW_TRAIL_2D = 15;
  const PREVIEW_TRAIL_3D = 20;

  function renderPreview() {
    if (!previewCanvas || hoveredIndex < 0) return;
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    if (view === 3) renderPreview3D();
    else if (dim === 2) renderPreview2D();
    else if (dim === 1) renderPreview1D();
  }

  function renderPreview3D() {
    // Gather trail of populations
    const startIdx = Math.max(0, hoveredIndex - PREVIEW_TRAIL_3D + 1);
    const populations: any[] = [];
    for (let i = startIdx; i <= hoveredIndex; i++) {
      const pop = automataStore.getPopulationAtIndex?.(i);
      if (pop) populations.push(pop);
    }
    if (populations.length === 0) return;
    // Set canvas to display size for WebGL rendering
    previewCanvas.width = previewDisplaySize.width;
    previewCanvas.height = previewDisplaySize.height;
    automataStore.renderPreviewFrame?.(populations, previewCanvas);
  }

  function renderPreview2D() {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const bg = automataStore.cellStates[0]?.color;
    const fg = automataStore.cellStates[1]?.color;
    const shape = automataStore.populationShape;
    const w = shape.x ?? 1;
    const h = shape.y ?? 1;

    previewCanvas.width = w;
    previewCanvas.height = h;
    ctx.fillStyle = automataStore.hslString(bg);
    ctx.fillRect(0, 0, w, h);

    const startIdx = Math.max(0, hoveredIndex - PREVIEW_TRAIL_2D + 1);
    const totalSteps = hoveredIndex - startIdx + 1;
    const fgH = fg.h;
    const fgS = Math.floor(fg.s * 100);
    const fgL = Math.floor(fg.l * 100);

    // Render oldest to newest so newest overwrites
    for (let gi = startIdx; gi <= hoveredIndex; gi++) {
      const pop = automataStore.getPopulationAtIndex?.(gi);
      if (!pop) continue;
      const rows = pop as number[][];

      const age = hoveredIndex - gi;
      const t = totalSteps > 1 ? 1 - age / (totalSteps - 1) : 1;
      // Lerp lightness: oldest → 92% (nearly invisible), newest → fg lightness
      const lightness = Math.floor(92 - t * (92 - fgL));
      ctx.fillStyle = `hsl(${fgH}, ${fgS}%, ${lightness}%)`;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (rows[y][x] === 1) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  function renderPreview1D() {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const bg = automataStore.cellStates[0]?.color;
    const fg = automataStore.cellStates[1]?.color;

    const startIdx = Math.max(0, hoveredIndex - PREVIEW_TRAIL_1D + 1);
    const numRows = hoveredIndex - startIdx + 1;

    // Get width from first population
    const pop0 = automataStore.getPopulationAtIndex?.(startIdx);
    if (!pop0) return;
    const w = (pop0 as number[]).length;

    previewCanvas.width = w;
    previewCanvas.height = numRows;
    ctx.fillStyle = automataStore.hslString(bg);
    ctx.fillRect(0, 0, w, numRows);
    ctx.fillStyle = automataStore.hslString(fg);

    // Each row is a generation, newest at bottom
    for (let row = 0; row < numRows; row++) {
      const pop = automataStore.getPopulationAtIndex?.(startIdx + row);
      if (!pop) continue;
      const cells = pop as number[];
      for (let x = 0; x < w; x++) {
        if (cells[x] === 1) {
          ctx.fillRect(x, row, 1, 1);
        }
      }
    }
  }

  let tooltipLeft = $derived.by(() => {
    const tooltipWidth = 168;
    const half = tooltipWidth / 2;
    if (barWidth <= 0) return hoverX;
    return Math.max(half, Math.min(barWidth - half, hoverX));
  });

  let previewDisplaySize = $derived.by(() => {
    const dim = automataStore.dimension;
    const shape = automataStore.populationShape;
    const maxW = 160;
    if (dim === 2) {
      const w = shape.x ?? 1;
      const h = shape.y ?? 1;
      const scale = maxW / w;
      return { width: maxW, height: Math.round(h * scale) };
    }
    if (dim === 1) {
      const w = shape.x ?? 1;
      const numRows = Math.min(PREVIEW_TRAIL_1D, hoveredIndex + 1);
      const h = Math.max(1, numRows);
      return { width: maxW, height: Math.max(20, Math.round(maxW * h / w)) };
    }
    if (dim === 3) {
      return { width: maxW, height: maxW };
    }
    return { width: 0, height: 0 };
  });

  let showTooltip = $derived(
    active && hoveredIndex >= 0 && automataStore.totalGenerations > 1
  );

  let showCanvas = $derived(showTooltip);

  let asideEl: HTMLElement;

  onMount(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

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
            <canvas
              bind:this={previewCanvas}
              style="width: {previewDisplaySize.width}px; height: {previewDisplaySize.height}px; {automataStore.viewer === 3 ? '' : 'image-rendering: pixelated;'} border-radius: 2px;"
            ></canvas>
          {/if}
          <span
            style="color: rgba(255,255,255,0.8); font-size: 11px; margin-top: {showCanvas ? 4 : 0}px; font-family: monospace; white-space: nowrap;"
          >Gen {hoveredIndex}</span>
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
    {#if automataStore.totalGenerations > 1}
      <div
        style="position: absolute; top: 50%; left: {progressPercent}%; transform: translate(-50%, -50%); width: 18px; height: 18px; background-color: black; border-radius: 50%; pointer-events: none; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"
      ></div>
    {/if}
  </div>

  <!-- Buttons Row -->
  <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between">
    <!-- Left: Play + Reset -->
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

      <!-- Seed Toggle Button (only when a saved seed exists) -->
      {#if automataStore.savedSeed}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="flex cursor-pointer items-center gap-2"
          style="height: 44px; padding: 0 14px; border-radius: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); font-size: 13px; white-space: nowrap;"
          title={automataStore.useSavedSeed ? 'Rerun with random seed' : 'Rerun with claimed seed'}
          onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
          onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
          onclick={() => { automataStore.useSavedSeed = !automataStore.useSavedSeed; automataStore.reset(); }}
        >
          {#if automataStore.useSavedSeed}
            <!-- Dice icon — click to use random seed -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="16" r="1.5" fill="currentColor" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
            Random seed
          {:else}
            <!-- Pin icon — click to use saved seed -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76z" />
            </svg>
            Claimed seed
          {/if}
        </div>
      {/if}

    </div>

    <!-- Right: Save + Like + Bookmark -->
    <div class="flex items-center gap-2">
      <!-- Save Button (signed in only) -->
      <SignedIn>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="flex cursor-pointer items-center justify-center"
          style="height: 44px; width: 44px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
          onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
          onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
          onclick={() => (saveDialogOpen = true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.707 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.293 7.707a1 1 0 01-1.414-1.414l4-4z" />
            <path d="M3 15a2 2 0 012-2h10a2 2 0 012 2v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
          </svg>
        </div>
      </SignedIn>

      <!-- Like Button (only when saved) -->
      {#if savedEntityId}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="flex cursor-pointer items-center justify-center"
          style="height: 44px; min-width: 44px; padding: 0 8px; border-radius: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
          onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
          onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
          onclick={toggleLike}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          {#if likeCount > 0}
            <span class="ml-1 text-xs font-medium">{likeCount}</span>
          {/if}
        </div>
      {/if}

      <!-- Bookmark Button (only when saved) -->
      {#if savedEntityId}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="flex cursor-pointer items-center justify-center"
          style="height: 44px; width: 44px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); color: white; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);"
          onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.85)'; }}
          onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(0,0,0,0.7)'; }}
          onclick={toggleBookmark}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
            <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
            <line x1="4" y1="13" x2="20" y2="13" />
            <rect x="10" y="11" width="4" height="4" rx="1" />
          </svg>
        </div>
      {/if}
    </div>
  </div>
</aside>

<SaveDialog bind:open={saveDialogOpen} onsaved={handleSaved} />
