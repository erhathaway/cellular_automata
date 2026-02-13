<script lang="ts">
  import ViewPlayer from '$lib/components/ViewPlayer.svelte';
  import MenuPanel from '$lib/components/MenuPanel.svelte';
  import ViewModeSwitcher from '$lib/components/ViewModeSwitcher.svelte';
  import ViewControls from '$lib/components/ViewControls.svelte';
  import RandomRuleButton from '$lib/components/RandomRuleButton.svelte';
  import MiningLevelButton from '$lib/components/MiningLevelButton.svelte';
  import LatticePickerButton from '$lib/components/LatticePickerButton.svelte';
  import HistoryNavButton from '$lib/components/HistoryNavButton.svelte';
  import ViewerDescription from '$lib/components/ViewerDescription.svelte';
  import ViewerComments from '$lib/components/ViewerComments.svelte';
  import CornerBlocks from '$lib/components/CornerBlocks.svelte';
  import AdvancedPanel from '$lib/components/AdvancedPanel.svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { historyStore } from '$lib/stores/history.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams } from '$lib/stores/persistence';
  import { goto } from '$app/navigation';
  import type { HistoryEntry } from '$lib/stores/history.svelte';

  let advancedOpen = $derived(automataStore.advancedMode);
  let canGoBack = $derived(historyStore.canGoBack);
  let canGoForward = $derived(historyStore.canGoForward);

  function loadHistoryEntry(entry: HistoryEntry) {
    const rule = deserializeRule(entry.ruleDefinition);
    if (!rule) return;

    const settings: Record<string, any> = {
      populationShape: { ...entry.populationShape },
      rule,
      cellStates: entry.cellStates.map((s) => ({ ...s })),
      neighborhoodRadius: entry.neighborhoodRadius,
    };
    if (entry.lattice) settings.lattice = entry.lattice;
    if (entry.trailConfig) settings.trailConfig = { ...entry.trailConfig };

    automataStore.hydrateCombo(entry.dimension, entry.viewer, settings);
    automataStore.hydrateActive(entry.dimension, entry.viewer);
    automataStore.generationRunId = null;
    automataStore.savedSeed = null;
    automataStore.useSavedSeed = true;
    automataStore.resetMiningToRandom();
    automataStore.reset();

    const params = buildURLParams(entry.dimension, entry.viewer, settings);
    goto(`/mine?${params.toString()}`, { replaceState: true });
  }

  function handleHistoryBack() {
    const entry = historyStore.goBack();
    if (entry) loadHistoryEntry(entry);
  }

  function handleHistoryForward() {
    const entry = historyStore.goForward();
    if (entry) loadHistoryEntry(entry);
  }
</script>

<div class="mine-page-bg">
<div class="relative" style="height: 75vh; margin: 0 1rem;">
  <CornerBlocks />
  <!-- Electric containment edges over the black border -->
  <span class="edge top"></span>
  <span class="edge bottom"></span>
  <span class="edge left"></span>
  <span class="edge right"></span>
  <section class="relative h-full overflow-hidden rounded-2xl" style="border: 14px solid #000;">
    <ViewPlayer />
    <div class="pointer-events-none absolute inset-0 z-10 rounded-2xl" style="box-shadow: inset 0 0 30px rgba(0,0,0,0.15), inset 0 0 2px rgba(0,0,0,0.1);"></div>
    <ViewControls />
  </section>
  <div class="pointer-events-none absolute bottom-0 left-0 right-0 z-50 translate-y-1/2">
    <div class="controls-row">
      <div class="controls-far-left pointer-events-auto">
        <div class="pipe-backdrop-far-left"></div>
        <HistoryNavButton direction="back" disabled={!canGoBack} onclick={handleHistoryBack} />
      </div>
      <div class="controls-left pointer-events-auto">
        <div class="pipe-backdrop"></div>
        <MiningLevelButton disabled={advancedOpen} />
      </div>
      <div class="controls-center pointer-events-auto">
        <RandomRuleButton />
      </div>
      <div class="controls-right pointer-events-auto">
        <div class="pipe-backdrop-right"></div>
        <LatticePickerButton disabled={advancedOpen} />
      </div>
      <div class="controls-far-right pointer-events-auto">
        <div class="pipe-backdrop-far-right"></div>
        <HistoryNavButton direction="forward" disabled={!canGoForward} onclick={handleHistoryForward} />
      </div>
    </div>
  </div>
</div>

<section class="relative z-10 bg-black">
  <!-- Advanced toggle button + panel -->
  <div class="advanced-toggle">
    <div class="adv-pipe">
      <div class="adv-pipe-outer">
        <div class="adv-pipe-inner"></div>
      </div>
      <div class="adv-pipe-flange adv-pipe-flange-top"></div>
      <div class="adv-pipe-flange adv-pipe-flange-bottom"></div>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="adv-btn {advancedOpen ? 'adv-open' : ''}" onclick={() => automataStore.setAdvancedMode(!automataStore.advancedMode)}>
      <div class="nails">
        <div class="nail"></div>
        <div class="nail"></div>
      </div>
      <div class="nails nails-bottom">
        <div class="nail"></div>
        <div class="nail"></div>
      </div>
      <span class="adv-pretitle">Mode</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="adv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
      <span class="adv-label">Advanced</span>
      <span class="adv-status" class:adv-off={!advancedOpen}>{advancedOpen ? 'On' : 'Off'}</span>
    </div>
  </div>

  {#if advancedOpen}
    <div class="advanced-panel-slot">
      <AdvancedPanel onclose={() => automataStore.setAdvancedMode(false)} />
    </div>
  {/if}

  <ViewerDescription />
  <ViewerComments />
</section>
</div>

<style>
  .mine-page-bg {
    background: blue;
    min-height: 100%;
    padding: 1rem 0;
  }

  /* Electric edges overlaying the black border */
  .edge {
    position: absolute;
    z-index: 15;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.5));
  }

  .edge.top, .edge.bottom {
    left: 60px;
    right: 60px;
    height: 2px;
    background: repeating-linear-gradient(
      90deg, #facc15 0px, #facc15 4px, transparent 4px, transparent 9px
    );
    background-size: 18px 2px;
    animation: electric-h 0.6s linear infinite;
  }

  .edge.top { top: 6px; }
  .edge.bottom { bottom: 6px; }

  .edge.left, .edge.right {
    top: 60px;
    bottom: 60px;
    width: 2px;
    background: repeating-linear-gradient(
      180deg, #facc15 0px, #facc15 4px, transparent 4px, transparent 9px
    );
    background-size: 2px 18px;
    animation: electric-v 0.6s linear infinite;
  }

  .edge.left { left: 6px; }
  .edge.right { right: 6px; }

  @keyframes electric-h {
    0%   { background-position: 0 0; }
    100% { background-position: 18px 0; }
  }

  @keyframes electric-v {
    0%   { background-position: 0 0; }
    100% { background-position: 0 18px; }
  }

  .controls-row {
    display: grid;
    grid-template-columns: auto auto auto auto auto;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .controls-far-left {
    position: relative;
    margin-right: 20px;
  }

  .controls-left {
    position: relative;
    margin-right: 38px;
  }

  .controls-center {
    position: relative;
  }

  .controls-right {
    position: relative;
    margin-left: 38px;
  }

  .controls-far-right {
    position: relative;
    margin-left: 20px;
  }

  /* --- Far-left: back button → level button pipe --- */
  .controls-far-left::after {
    content: '';
    position: absolute;
    left: calc(100% + 1px);
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-far-left .pipe-backdrop-far-left {
    position: absolute;
    left: calc(100% - 1px);
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  .controls-left :global(.level-root) {
    transform: translateX(-2px);
  }

  /* Glowing connector pipe from level button to mine button */
  .controls-left::after {
    content: '';
    position: absolute;
    left: calc(100% - 4px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 42px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-left::before {
    content: '';
    position: absolute;
    left: calc(100% + 38px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-left .pipe-backdrop {
    position: absolute;
    left: calc(100% - 5px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 50px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  .controls-right :global(.lattice-root) {
    transform: translateX(2px);
  }

  /* Glowing connector pipe from mine button to lattice button */
  .controls-right::after {
    content: '';
    position: absolute;
    right: calc(100% - 4px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 42px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-right::before {
    content: '';
    position: absolute;
    right: calc(100% + 38px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-right .pipe-backdrop-right {
    position: absolute;
    right: calc(100% - 5px);
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 50px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  /* --- Far-right: lattice button → forward button pipe --- */
  .controls-far-right::before {
    content: '';
    position: absolute;
    right: calc(100% + 1px);
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 14px;
    border-radius: 3px;
    border: 2px solid #0e7490;
    background:
      linear-gradient(
        90deg,
        #0c4a6e 0%,
        #22d3ee 50%,
        #0c4a6e 100%
      );
    box-shadow:
      0 0 10px rgba(34, 211, 238, 0.75),
      inset 0 0 6px rgba(103, 232, 249, 0.95);
    pointer-events: none;
    z-index: 2;
    animation: connector-pulse 1.1s ease-in-out infinite;
  }

  .controls-far-right .pipe-backdrop-far-right {
    position: absolute;
    right: calc(100% - 1px);
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 18px;
    border-radius: 3px;
    background: #1c1917;
    pointer-events: none;
    z-index: 1;
  }

  .controls-center::before,
  .controls-center::after {
    content: '';
    position: absolute;
    top: calc(50% - 8px);
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: linear-gradient(180deg, #57534e 0%, #78716c 50%, #57534e 100%);
    border: 1px solid #44403c;
    box-shadow: 0 0 5px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    z-index: 2;
  }

  .controls-center::before {
    left: -22px;
  }

  .controls-center::after {
    right: -22px;
  }

  /* Advanced toggle button */
  .advanced-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1rem;
  }

  .adv-pipe {
    position: relative;
    width: 14px;
    height: 80px;
  }

  .adv-pipe-outer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      #1c1917 0%,
      #292524 20%,
      #44403c 50%,
      #292524 80%,
      #1c1917 100%
    );
    border-radius: 3px;
    border: 1px solid #57534e;
    overflow: hidden;
  }

  .adv-pipe-inner {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    transform: translateX(-50%);
    background: rgba(34, 211, 238, 0.15);
    box-shadow: 0 0 6px rgba(34, 211, 238, 0.3);
    animation: adv-pipe-glow 1.1s ease-in-out infinite;
  }

  @keyframes adv-pipe-glow {
    0%   { background: rgba(34, 211, 238, 0.15); }
    50%  { background: rgba(34, 211, 238, 0.5); }
    100% { background: rgba(34, 211, 238, 0.15); }
  }

  .adv-pipe-flange {
    position: absolute;
    left: -3px;
    right: -3px;
    height: 6px;
    background: linear-gradient(
      180deg,
      #57534e 0%,
      #78716c 40%,
      #57534e 100%
    );
    border-radius: 2px;
    border: 1px solid #44403c;
  }

  .adv-pipe-flange-top {
    top: -2px;
  }

  .adv-pipe-flange-bottom {
    bottom: -2px;
  }

  .adv-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 18px 22px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 1px solid #44403c;
    border-radius: 6px;
    color: #67e8f9;
    transition: border-color 0.15s, background-color 0.15s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
  }

  .adv-btn:hover,
  .adv-btn.adv-open {
    border-color: #67e8f9;
    background-color: #292524;
  }

  .adv-btn .nails {
    position: absolute;
    top: 5px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .adv-btn .nails-bottom {
    top: auto;
    bottom: 5px;
  }

  .adv-btn .nail {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 3px rgba(103, 232, 249, 0.25);
  }

  .adv-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    filter: drop-shadow(0 0 7px rgba(103, 232, 249, 0.6));
  }

  .adv-pretitle {
    position: absolute;
    top: 8px;
    left: 74px;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    pointer-events: none;
  }

  .adv-label {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #cffafe;
    white-space: nowrap;
  }

  .adv-status {
    position: absolute;
    bottom: 6px;
    left: 74px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    pointer-events: none;
  }

  .adv-status.adv-off {
    color: #78590a;
  }

  .advanced-panel-slot {
    position: relative;
    margin-top: 16px;
  }

  @keyframes connector-pulse {
    0% {
      box-shadow:
        0 0 8px rgba(34, 211, 238, 0.45),
        inset 0 0 4px rgba(34, 211, 238, 0.45);
    }
    50% {
      box-shadow:
        0 0 14px rgba(34, 211, 238, 0.9),
        inset 0 0 8px rgba(103, 232, 249, 0.85);
    }
    100% {
      box-shadow:
        0 0 8px rgba(34, 211, 238, 0.45),
        inset 0 0 4px rgba(34, 211, 238, 0.45);
    }
  }
</style>
