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
  import AnalysisOverlayContent from '$lib/components/AnalysisOverlayContent.svelte';
  import SteelPanel from '$lib/components/SteelPanel.svelte';
  import Pipe from '$lib/components/Pipe.svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { historyStore } from '$lib/stores/history.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams } from '$lib/stores/persistence';
  import { goto } from '$app/navigation';
  import type { HistoryEntry } from '$lib/stores/history.svelte';

  let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1440);
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

<svelte:window bind:innerWidth={innerWidth} />
<div class="mine-page-bg">
<div class="relative" style="height: clamp(300px, 55vw, 75vh); margin: 0 1rem;">
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
        <HistoryNavButton direction="back" disabled={!canGoBack} onclick={handleHistoryBack} />
        <Pipe variant="glow" color="yellow" width="clamp(8px, 1.5vw, 20px)" height="14px" backdrop
          style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); z-index: 2;" />
      </div>
      <div class="controls-left pointer-events-auto">
        <MiningLevelButton disabled={advancedOpen} />
        <Pipe variant="glow" color="yellow" width="clamp(20px, 3vw, 42px)" height="14px" backdrop
          style="position: absolute; left: calc(100% - 3px); top: 50%; transform: translateY(-50%); z-index: 2;" />
        <Pipe variant="joint" color="yellow" width="4px" height="20px"
          style="position: absolute; left: calc(100% + clamp(16px, 3vw, 38px)); top: 50%; transform: translateY(-50%); z-index: 2;" />
      </div>
      <div class="controls-center pointer-events-auto">
        <RandomRuleButton />
        <Pipe variant="joint" color="yellow" width="4px" height="20px"
          style="position: absolute; left: clamp(-22px, -1.8vw, -14px); top: 50%; transform: translateY(-50%); z-index: 2;" />
        <Pipe variant="joint" color="yellow" width="4px" height="20px"
          style="position: absolute; right: clamp(-22px, -1.8vw, -14px); top: 50%; transform: translateY(-50%); z-index: 2;" />
      </div>
      <div class="controls-right pointer-events-auto">
        <LatticePickerButton disabled={advancedOpen} />
        <Pipe variant="glow" color="yellow" width="clamp(20px, 3vw, 42px)" height="14px" backdrop
          style="position: absolute; right: calc(100% - 3px); top: 50%; transform: translateY(-50%); z-index: 2;" />
        <Pipe variant="joint" color="yellow" width="4px" height="20px"
          style="position: absolute; right: calc(100% + clamp(16px, 3vw, 38px)); top: 50%; transform: translateY(-50%); z-index: 2;" />
      </div>
      <div class="controls-far-right pointer-events-auto">
        <HistoryNavButton direction="forward" disabled={!canGoForward} onclick={handleHistoryForward} />
        <Pipe variant="glow" color="yellow" width="clamp(8px, 1.5vw, 20px)" height="14px" backdrop
          style="position: absolute; right: 100%; top: 50%; transform: translateY(-50%); z-index: 2;" />
      </div>
    </div>
  </div>
  <!-- Advanced toggle button (top-right corner) -->
  <div class="advanced-toggle pointer-events-auto">
    <!-- Vertical pipe: top of button → top of viewer -->
    <Pipe variant="metal" direction="vertical" color="yellow" width="14px" height="40px" flanges
      style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);" />
    <!-- Horizontal pipe: right of button → right of viewer -->
    <Pipe variant="metal" color="yellow" width="40px" height="14px" flanges
      style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%);" />
    <SteelPanel variant="cyan" active={advancedOpen} onclick={() => automataStore.setAdvancedMode(!automataStore.advancedMode)}>
      <div class="adv-btn">
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
    </SteelPanel>
  </div>
</div>

{#if innerWidth < 1000}
  <div class="inline-analysis">
    <AnalysisOverlayContent />
  </div>
{/if}

<section class="relative z-10 bg-black">
  {#if advancedOpen}
    <div class="advanced-panel-slot">
      <AdvancedPanel onclose={() => automataStore.setAdvancedMode(false)} />
    </div>
  {/if}

  <ViewerDescription compact={innerWidth < 1000} />
  <ViewerComments />
</section>
</div>

<style>
  .inline-analysis {
    padding: 72px 1rem 0;
    background: #000;
  }

  .inline-analysis :global(.analysis-body) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: auto;
    padding: 0;
    overflow: visible;
  }

  .inline-analysis :global(.analysis-body > *) {
    min-width: 0;
  }

  .inline-analysis :global(.status-card) {
    min-height: auto;
    padding: 8px 12px;
  }

  .inline-analysis :global(.status-card .iw-k) {
    font-size: 11px;
  }

  .inline-analysis :global(.status-card .iw-v) {
    font-size: 10px;
  }

  .inline-analysis :global(.count-card) {
    padding: 8px 12px;
  }

  .inline-analysis :global(.count-card .life-label-v) {
    font-size: 14px;
  }

  .inline-analysis :global(.bar-track) {
    height: 50px;
  }

  .inline-analysis :global(.peaks),
  .inline-analysis :global(.section-subtitle) {
    display: none;
  }

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
    margin-right: clamp(8px, 1.5vw, 20px);
  }

  .controls-left {
    position: relative;
    margin-right: clamp(16px, 3vw, 38px);
  }

  .controls-center {
    position: relative;
  }

  .controls-right {
    position: relative;
    margin-left: clamp(16px, 3vw, 38px);
  }

  .controls-far-right {
    position: relative;
    margin-left: clamp(8px, 1.5vw, 20px);
  }

  .controls-left :global(.level-root) {
    transform: translateX(-2px);
  }

  .controls-right :global(.lattice-root) {
    transform: translateX(2px);
  }

  /* Advanced toggle button — top-right of viewer */
  .advanced-toggle {
    position: absolute;
    top: 40px;
    right: 40px;
    z-index: 50;
  }


  .adv-btn {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1vw, 12px);
    cursor: pointer;
    padding: clamp(10px, 1.5vw, 18px) clamp(12px, 1.8vw, 22px);
    color: #67e8f9;
  }

  .adv-icon {
    width: clamp(22px, 3.5vw, 40px);
    height: clamp(22px, 3.5vw, 40px);
    flex-shrink: 0;
    filter: drop-shadow(0 0 7px rgba(103, 232, 249, 0.6));
  }

  .adv-pretitle {
    position: absolute;
    top: clamp(4px, 0.7vw, 8px);
    left: clamp(44px, 6.5vw, 74px);
    font-family: 'Space Mono', monospace;
    font-size: clamp(6px, 0.7vw, 8px);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    pointer-events: none;
  }

  .adv-label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.1vw, 13px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #cffafe;
    white-space: nowrap;
  }

  .adv-status {
    position: absolute;
    bottom: clamp(3px, 0.5vw, 6px);
    left: clamp(44px, 6.5vw, 74px);
    font-family: 'Space Mono', monospace;
    font-size: clamp(9px, 1.2vw, 14px);
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

</style>
