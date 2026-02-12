<script lang="ts">
  import AnalysisOverlayContent from '$lib/components/AnalysisOverlayContent.svelte';
  import RightDrawerContent from '$lib/components/RightDrawerContent.svelte';
  import GalleryStats from '$lib/components/explore/GalleryStats.svelte';
  import PersistenceManager from '$lib/components/PersistenceManager.svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { page } from '$app/stores';

  let { children } = $props();

  let rightOpen = $state(true);
  let prevMining = $state(automataStore.isMining);

  const RIGHT_WIDTH = 360;

  function toggleRight() {
    if (rightOpen && viewerUiStore.analysisOpen) {
      viewerUiStore.closeAnalysis();
    }
    rightOpen = !rightOpen;
    animateResize();
  }

  function closeAnalysis() {
    viewerUiStore.closeAnalysis();
  }

  function animateResize() {
    const start = performance.now();
    const duration = 320;
    function loop() {
      window.dispatchEvent(new Event('resize'));
      if (performance.now() - start < duration) {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  }

  $effect(() => {
    const mining = automataStore.isMining;

    // Auto-open analysis when a new mine run starts (mine page only).
    if (mining && !prevMining && $page.url.pathname === '/') {
      viewerUiStore.openAnalysis();
    }

    prevMining = mining;
  });

  $effect(() => {
    const playing = automataStore.isPlaying;
    const analysisOpen = viewerUiStore.analysisOpen;
    if (playing && !analysisOpen && $page.url.pathname === '/') {
      viewerUiStore.openAnalysis();
    }
  });

  $effect(() => {
    if (viewerUiStore.analysisOpen && !rightOpen) {
      rightOpen = true;
      animateResize();
    }
  });
</script>

<PersistenceManager />

<div class="flex h-full w-full">
  <!-- Center: viewer content -->
  <main class="viewer-main relative h-full min-w-0 flex-1 overflow-y-auto" style="background: blue;">
    {@render children()}

    <!-- Right toggle tab -->
    <button
      class="toggle-tab"
      onclick={toggleRight}
      aria-label={rightOpen ? 'Close right panel' : 'Open right panel'}
    >
      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
        {#if rightOpen}
          <path d="M4.5 2L7.5 6L4.5 10" />
        {:else}
          <path d="M7.5 2L4.5 6L7.5 10" />
        {/if}
      </svg>
    </button>
  </main>

  <!-- Right drawer -->
  <aside
    class="relative h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
    style:width="{rightOpen ? RIGHT_WIDTH : 0}px"
    style:background="white"
    style:border-left="1px solid #e7e5e4"
  >
    <div class="relative h-full" style:width="{RIGHT_WIDTH}px">
      {#if $page.url.pathname === '/explore'}
        <div class="gallery-stats-panel">
          <div class="gallery-stats-header">
            <span class="gallery-stats-title">Gallery Stats</span>
          </div>
          <GalleryStats />
        </div>
      {:else}
        <RightDrawerContent />
      {/if}
      {#if viewerUiStore.analysisOpen && $page.url.pathname === '/'}
        <div class="analysis-overlay">
          <div class="analysis-pipe analysis-pipe-top" aria-hidden="true"></div>
          <div class="analysis-pipe analysis-pipe-bottom" aria-hidden="true"></div>
          <div class="analysis-header">
            <span class="analysis-title">Analysis</span>
            <button type="button" class="analysis-close" onclick={closeAnalysis} aria-label="Close analysis drawer">
              ✕
            </button>
          </div>
          <AnalysisOverlayContent />
        </div>
      {/if}
    </div>
  </aside>
</div>

<style>
  .viewer-main {
    scrollbar-width: none;
  }
  .viewer-main::-webkit-scrollbar {
    display: none;
  }

  .toggle-tab {
    position: absolute;
    right: 0;
    top: 16px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 48px;
    border: none;
    border-radius: 6px 0 0 6px;
    cursor: pointer;
    background: #1c1917;
    color: #facc15;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
    transition: background 0.2s ease, color 0.2s ease;
  }

  .toggle-tab:hover {
    background: #292524;
    color: #fde047;
  }

  .gallery-stats-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .gallery-stats-header {
    display: flex;
    align-items: center;
    padding: 18px 18px 14px 18px;
    border-bottom: 1px solid #e7e5e4;
  }

  .gallery-stats-title {
    font-family: 'Space Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1c1917;
  }

  .analysis-overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    background:
      radial-gradient(120% 120% at 0% 0%, #111111 0%, #000000 55%, #000000 100%);
    color: #facc15;
    box-shadow:
      inset 8px 0 24px rgba(0, 0, 0, 0.75),
      inset 0 0 0 1px #292524;
  }

  .analysis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px 14px 18px;
    border-bottom: 1px solid #44403c;
    background:
      linear-gradient(
        180deg,
        rgba(250, 204, 21, 0.09) 0%,
        rgba(250, 204, 21, 0.02) 100%
      );
  }

  .analysis-title {
    font-family: 'Space Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fde047;
  }

  .analysis-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid #57534e;
    background: #111111;
    color: #facc15;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s, color 0.15s;
  }

  .analysis-close:hover {
    border-color: #facc15;
    background: #1c1917;
    color: #fde047;
  }

  .analysis-pipe {
    position: absolute;
    left: -28px;
    width: 28px;
    height: 14px;
    border-radius: 3px 0 0 3px;
    border: 2px solid #facc15;
    border-right: none;
    background:
      linear-gradient(
        90deg,
        #ca8a04 0%,
        #fde047 50%,
        #ca8a04 100%
      );
    box-shadow:
      0 0 14px rgba(250, 204, 21, 0.5),
      inset 0 0 6px rgba(254, 240, 138, 0.9);
    animation: analysis-pipe-pulse 1.2s ease-in-out infinite;
  }

  .analysis-pipe-top {
    top: 88px;
  }

  .analysis-pipe-bottom {
    top: 122px;
  }

  @keyframes analysis-pipe-pulse {
    0% {
      box-shadow:
        0 0 8px rgba(250, 204, 21, 0.35),
        inset 0 0 3px rgba(254, 240, 138, 0.55);
    }
    50% {
      box-shadow:
        0 0 15px rgba(250, 204, 21, 0.75),
        inset 0 0 8px rgba(254, 240, 138, 0.95);
    }
    100% {
      box-shadow:
        0 0 8px rgba(250, 204, 21, 0.35),
        inset 0 0 3px rgba(254, 240, 138, 0.55);
    }
  }
</style>
