<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';

  let progressBarEl: HTMLElement;
  let previewCanvas: HTMLCanvasElement = $state(undefined as any);
  let isDragging = $state(false);
  let wasPlayingBeforeDrag = false;
  let isHovering = $state(false);
  let hoverX = $state(0);
  let hoveredIndex = $state(-1);
  let barWidth = $state(0);

  let progressPercent = $derived(
    automataStore.totalGenerations > 1
      ? (automataStore.generationIndex / (automataStore.totalGenerations - 1)) * 100
      : 0
  );

  let fillColor = $derived(
    automataStore.hslString(automataStore.cellStates[1]?.color ?? { h: 0, s: 0, l: 0, a: 1 })
  );

  let active = $derived(isHovering || isDragging);

  function getSeekIndexFromEvent(e: MouseEvent) {
    if (!progressBarEl) return 0;
    const rect = progressBarEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round(ratio * (automataStore.totalGenerations - 1));
  }

  function updateHoverFromEvent(e: MouseEvent) {
    if (!progressBarEl) return;
    const rect = progressBarEl.getBoundingClientRect();
    hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    barWidth = rect.width;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hoveredIndex = Math.round(ratio * (automataStore.totalGenerations - 1));
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

  function renderPreview() {
    if (!previewCanvas || hoveredIndex < 0) return;
    const pop = automataStore.getPopulationAtIndex?.(hoveredIndex);
    if (!pop) return;

    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const dim = automataStore.dimension;
    const bgStr = automataStore.hslString(automataStore.cellStates[0]?.color);
    const fgStr = automataStore.hslString(automataStore.cellStates[1]?.color);

    if (dim === 2) {
      const rows = pop as number[][];
      const h = rows.length;
      const w = rows[0]?.length ?? 0;
      previewCanvas.width = w;
      previewCanvas.height = h;
      ctx.fillStyle = bgStr;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = fgStr;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (rows[y][x] === 1) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    } else if (dim === 1) {
      const cells = pop as number[];
      const w = cells.length;
      previewCanvas.width = w;
      previewCanvas.height = 1;
      ctx.fillStyle = bgStr;
      ctx.fillRect(0, 0, w, 1);
      ctx.fillStyle = fgStr;
      for (let x = 0; x < w; x++) {
        if (cells[x] === 1) {
          ctx.fillRect(x, 0, 1, 1);
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
    if (dim === 2) {
      const w = shape.x ?? 1;
      const h = shape.y ?? 1;
      const maxW = 160;
      const scale = maxW / w;
      return { width: maxW, height: Math.round(h * scale) };
    }
    if (dim === 1) {
      return { width: 160, height: 20 };
    }
    return { width: 0, height: 0 };
  });

  let showTooltip = $derived(
    active && hoveredIndex >= 0 && automataStore.totalGenerations > 1
  );

  let showCanvas = $derived(showTooltip && automataStore.dimension !== 3);

  onMount(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
    };
  });
</script>

<aside
  class="fixed z-20"
  style="bottom: 20px; left: 250px; height: 95px; width: calc(100% - 500px); min-width: 400px;"
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
              style="width: {previewDisplaySize.width}px; height: {previewDisplaySize.height}px; image-rendering: pixelated; border-radius: 2px;"
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
      style="position: absolute; top: 50%; left: 0; right: 0; height: {active ? 5 : 3}px; transform: translateY(-50%); background: rgba(255,255,255,0.2); border-radius: 3px; transition: height 0.15s ease; overflow: hidden;"
    >
      <!-- Progress Fill -->
      <div
        style="height: 100%; width: {progressPercent}%; background-color: {fillColor}; border-radius: 3px 0 0 3px;"
      ></div>
    </div>

    <!-- Handle -->
    {#if automataStore.totalGenerations > 1}
      <div
        style="position: absolute; top: 50%; left: {progressPercent}%; transform: translate(-50%, -50%); width: {active ? 14 : 0}px; height: {active ? 14 : 0}px; background-color: {fillColor}; border-radius: 50%; transition: width 0.15s ease, height 0.15s ease; pointer-events: none; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"
      ></div>
    {/if}
  </div>

  <!-- Play Button -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <aside
    class="absolute bottom-0 left-0 flex cursor-pointer items-center justify-center text-center"
    style="height: 60px; width: 70px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); color: rgba(156,156,156,1); font-size: 25px; background-color: black;"
    onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.backgroundImage = 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1))'; }}
    onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundImage = 'none'; }}
    onclick={() => automataStore.togglePlay()}
  >
    {#if automataStore.isPlaying}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" style="height: 25px; width: 25px;">
        <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" style="height: 25px; width: 25px;">
        <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
      </svg>
    {/if}
  </aside>

  <!-- Menu Container with Reset Button -->
  <aside
    class="absolute bottom-0 right-0 flex items-center justify-center text-center"
    style="height: 60px; width: calc(100% - 90px); background-color: #4040403d; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);"
  >
    <!-- Reset/Reverse Button -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute bottom-0 left-0 flex cursor-pointer flex-col items-center justify-stretch"
      style="height: 100%; width: 90px; border-radius: 4px; border-bottom-right-radius: 0; border-top-right-radius: 0; color: rgba(0,0,0,0);"
      onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundImage = 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1))'; el.style.color = 'rgba(156,156,156,1)'; }}
      onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundImage = 'none'; el.style.color = 'rgba(0,0,0,0)'; }}
      onclick={() => automataStore.reset()}
    >
      <div
        class="flex flex-grow-[3] items-center text-center"
        style="color: rgba(156,156,156,0.6); font-size: 23px;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </aside>
</aside>
