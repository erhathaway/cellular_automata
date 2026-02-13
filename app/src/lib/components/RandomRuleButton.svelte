<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { historyStore } from '$lib/stores/history.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import SteelPanel from '$lib/components/SteelPanel.svelte';
  import Pipe from '$lib/components/Pipe.svelte';

  let mining = $derived(automataStore.isMining);
  let miningTimer: ReturnType<typeof setTimeout> | undefined;
  let miningKey = $state(0);
  let hasCompletedMine = $state(false);
  let btnEl = $state<HTMLElement>();
  let notViable = $derived(hasCompletedMine && !automataStore.isViableAutomata);

  // Mini 1D cellular automata that runs inside the button while mining
  const COLS = 18;
  const ROWS = 3;
  let cells = $state<number[][]>([]);
  let caInterval: ReturnType<typeof setInterval> | undefined;

  function randomRow(): number[] {
    return Array.from({ length: COLS }, () => Math.random() < 0.4 ? 1 : 0);
  }

  // Wolfram-style Rule 30 step (chaotic, looks like digging)
  function stepRow(row: number[]): number[] {
    const next: number[] = [];
    for (let i = 0; i < row.length; i++) {
      const l = row[(i - 1 + row.length) % row.length];
      const c = row[i];
      const r = row[(i + 1) % row.length];
      // Rule 30: 30 in binary = 00011110
      const idx = (l << 2) | (c << 1) | r;
      next.push((30 >> idx) & 1);
    }
    return next;
  }

  function startCA() {
    // Seed with random rows
    cells = Array.from({ length: ROWS }, () => randomRow());
    caInterval = setInterval(() => {
      cells = [
        ...cells.slice(1),
        stepRow(cells[cells.length - 1]),
      ];
    }, 200);
  }

  function stopCA() {
    clearInterval(caInterval);
    cells = [];
  }

  $effect(() => {
    if (mining) {
      startCA();
    } else {
      stopCA();
    }
  });

  // End mining early when automata enters a non-healthy state (died, frozen, intervention)
  $effect(() => {
    if (mining && !automataStore.isViableAutomata) {
      clearTimeout(miningTimer);
      automataStore.isMining = false;
      hasCompletedMine = true;
    }
  });

  function recordHistory() {
    const rule = automataStore.rule;
    const ruleDefinition = serializeRule(rule);
    historyStore.addEntry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      dimension: automataStore.dimension,
      viewer: automataStore.viewer,
      ruleType: rule.type,
      ruleDefinition,
      neighborhoodRadius: automataStore.neighborhoodRadius,
      lattice: automataStore.lattice,
      populationShape: { ...automataStore.populationShape },
      cellStates: automataStore.cellStates.map((s: any) => ({ ...s })),
      trailConfig: { ...automataStore.trailConfig },
    });
  }

  function handleClick() {
    clearTimeout(miningTimer);
    historyStore.resetCursor();
    viewerUiStore.openAnalysis();
    automataStore.isMining = true;
    miningKey++;
    automataStore.randomizeRule();
    // Record to history immediately after rule change
    recordHistory();
    miningTimer = setTimeout(() => {
      automataStore.isMining = false;
      hasCompletedMine = true;
      // Only fire gem animation if automata is viable (not extinct/frozen/intervention)
      if (automataStore.isViableAutomata && btnEl) {
        const rect = btnEl.getBoundingClientRect();
        automataStore.mineGemOrigin = { x: rect.left + rect.width / 2, y: rect.top };
        automataStore.mineGemAnimationCounter++;
      }
    }, 3000);
  }
</script>

<div class="mine-root">
  <!-- Pipes connecting button to frame -->
  <Pipe variant="metal" direction="vertical" color="yellow" width="14px" height="32px" flanges
    active={mining} animate={mining}
    style="position: absolute; left: 20px; bottom: 50%; z-index: -1;" />
  <Pipe variant="metal" direction="vertical" color="yellow" width="14px" height="32px" flanges
    active={mining} animate={mining}
    style="position: absolute; right: 20px; bottom: 50%; z-index: -1;" />

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <SteelPanel variant="muted" borderRadius="8px" borderWidth={2} style="overflow: visible; z-index: 1; width: var(--mine-width); padding: var(--mine-pad);">
    <!-- Raised button -->
    <div class="mine-btn {mining ? 'mining' : ''}" bind:this={btnEl} onclick={handleClick}>
      <svg xmlns="http://www.w3.org/2000/svg" class="pickaxe {mining ? 'pickaxe-strike' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
        <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
        <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
        <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
      </svg>

      <div class="label-wrap" class:label-hidden={mining}>
        {#if hasCompletedMine}
          <span class="label label-found">{notViable ? 'No viable automata found' : 'Automata found!'}</span>
        {:else}
          <span class="label">Mine for<br>automata</span>
        {/if}
      </div>

      {#if mining && cells.length}
        <div class="ca-grid" style="--cols: {COLS}; --rows: {ROWS};">
          {#each cells as row, rowIndex (rowIndex)}
            {#each row as cell, cellIndex (cellIndex)}
              <div class="ca-cell" class:alive={cell}></div>
            {/each}
          {/each}
        </div>
      {/if}

      {#if mining}
        {#key miningKey}
          <div class="progress-track">
            <div class="progress-fill"></div>
          </div>
        {/key}
      {/if}
    </div>
  </SteelPanel>
</div>

<style>
  .mine-root {
    position: relative;
    --mine-width: clamp(200px, 35vw, 360px);
    --mine-pad: 14px 14px 18px;
  }

  .mine-btn {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: clamp(8px, 2vw, 14px);
    cursor: pointer;
    padding: 18px clamp(14px, 3vw, 32px);
    background: black;
    border: 1.5px solid #57534e;
    border-top-color: #78716c;
    border-bottom-color: #44403c;
    border-radius: 3px;
    color: #facc15;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
    box-shadow:
      0 4px 0 #0c0a09,
      0 6px 12px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .mine-btn:hover {
    border-color: #facc15;
    border-top-color: #fde047;
    background: black;
    box-shadow:
      0 4px 0 #0c0a09,
      0 6px 12px rgba(0,0,0,0.5),
      0 0 20px rgba(250, 204, 21, 0.15),
      inset 0 1px 0 rgba(255,255,255,0.12);
  }

  .mine-btn:active {
    transform: translateY(3px);
    border-color: #facc15;
    box-shadow:
      0 1px 0 #57534e,
      0 0 12px rgba(250, 204, 21, 0.2),
      inset 0 2px 4px rgba(0,0,0,0.3);
  }

  .mine-btn.mining {
    border-color: #facc15;
  }

  .pickaxe {
    width: clamp(20px, 3.5vw, 42px);
    height: clamp(20px, 3.5vw, 42px);
    flex-shrink: 0;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(10px, 2.5vw, 22px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .label-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    gap: 5px;
    flex: 1;
    text-align: center;
  }

  .label-found {
    color: #fde047;
    font-size: clamp(8px, 2vw, 16px);
  }

  .label-hidden {
    visibility: hidden;
  }

  /* Mini CA grid overlaid where the label text is */
  .ca-grid {
    position: absolute;
    left: 88px;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 1px;
    image-rendering: pixelated;
  }

  .ca-cell {
    aspect-ratio: 1;
    background: rgba(250, 204, 21, 0.08);
    transition: background 0.15s;
  }

  .ca-cell.alive {
    background: #facc15;
    box-shadow: 0 0 3px rgba(250, 204, 21, 0.4);
  }

  @keyframes strike {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-35deg); }
    45% { transform: rotate(15deg); }
    55% { transform: rotate(10deg); }
    70% { transform: rotate(-5deg); }
    85% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes fill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  :global(.pickaxe-strike) {
    transform-origin: 20% 85%;
    animation: strike 0.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  }

  .progress-track {
    position: absolute;
    left: 36px;
    right: 36px;
    bottom: 7px;
    height: 4px;
    background: rgba(250, 204, 21, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #facc15;
    border-radius: 2px;
    animation: fill 3s linear forwards;
  }

  @media (max-width: 1500px) {
    .mine-root {
      --mine-width: clamp(200px, calc(24vw), 360px);
      --mine-pad: clamp(8px, calc(1.2vw - 4px), 14px) clamp(8px, calc(1.2vw - 4px), 14px) clamp(10px, calc(1.6vw - 6px), 18px);
    }

    .mine-btn {
      padding: clamp(12px, calc(1.2vw), 18px) clamp(14px, calc(3.6vw - 22px), 32px);
      gap: clamp(8px, calc(1.2vw - 4px), 14px);
    }

    .pickaxe {
      width: clamp(20px, calc(4.4vw - 24px), 42px);
      height: clamp(20px, calc(4.4vw - 24px), 42px);
    }

    .label {
      font-size: clamp(10px, calc(2.4vw - 14px), 22px);
    }

    .label-found {
      font-size: clamp(8px, calc(1.6vw - 8px), 16px);
    }
  }
</style>
