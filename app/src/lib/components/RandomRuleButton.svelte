<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';

  let mining = $derived(automataStore.isMining);
  let miningTimer: ReturnType<typeof setTimeout> | undefined;
  let miningKey = $state(0);
  let hasCompletedMine = $state(false);
  let noLivingAutomata = $derived(
    hasCompletedMine && automataStore.stableKind === 'exact' && automataStore.stablePeriod <= 1
  );

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

  function handleClick() {
    clearTimeout(miningTimer);
    viewerUiStore.openAnalysis();
    automataStore.isMining = true;
    miningKey++;
    automataStore.randomizeRule();
    miningTimer = setTimeout(() => {
      automataStore.isMining = false;
      hasCompletedMine = true;
    }, 3000);
  }
</script>

<div class="mine-root">
  <!-- Pipes connecting button to frame -->
  <div class="pipe pipe-left" class:pipe-active={mining}>
    <div class="pipe-outer">
      <div class="pipe-inner"></div>
    </div>
    <div class="pipe-flange pipe-flange-top"></div>
    <div class="pipe-flange pipe-flange-bottom"></div>
  </div>
  <div class="pipe pipe-right" class:pipe-active={mining}>
    <div class="pipe-outer">
      <div class="pipe-inner"></div>
    </div>
    <div class="pipe-flange pipe-flange-top"></div>
    <div class="pipe-flange pipe-flange-bottom"></div>
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="mine-panel">
    <!-- Panel nails -->
    <div class="nails">
      <div class="nail"></div>
      <div class="nail"></div>
    </div>
    <div class="nails nails-bottom">
      <div class="nail"></div>
      <div class="nail"></div>
    </div>

    <!-- Raised button -->
    <div class="mine-btn {mining ? 'mining' : ''}" onclick={handleClick}>
      <svg xmlns="http://www.w3.org/2000/svg" class="pickaxe {mining ? 'pickaxe-strike' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
        <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
        <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
        <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
      </svg>

      <div class="label-wrap" class:label-hidden={mining}>
        {#if hasCompletedMine}
          <span class="label label-found">{noLivingAutomata ? 'No living automata found' : 'Automata found!'}</span>
          <span class="sub-label">Click again to find new ones</span>
        {:else}
          <span class="label">Mine for automata</span>
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
  </div>
</div>

<style>
  .mine-root {
    position: relative;
  }

  /* === Pipes === */
  .pipe {
    position: absolute;
    bottom: 50%;
    width: 14px;
    height: 32px;
    z-index: -1;
  }

  .pipe-left {
    left: 20px;
  }

  .pipe-right {
    right: 20px;
  }

  .pipe-outer {
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

  .pipe-inner {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    transform: translateX(-50%);
    background: rgba(250, 204, 21, 0.1);
    transition: all 0.3s;
  }

  .pipe-active .pipe-inner {
    background: rgba(250, 204, 21, 0.6);
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.5), 0 0 16px rgba(250, 204, 21, 0.2);
    animation: pipe-flow 0.6s linear infinite;
  }

  /* Flanges — metal rings at top and bottom of each pipe */
  .pipe-flange {
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

  .pipe-flange-top {
    top: -2px;
  }

  .pipe-flange-bottom {
    bottom: -2px;
  }

  .pipe-active .pipe-flange {
    border-color: rgba(250, 204, 21, 0.3);
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.15);
  }

  @keyframes pipe-flow {
    0% {
      background: rgba(250, 204, 21, 0.4);
    }
    50% {
      background: rgba(250, 204, 21, 0.8);
    }
    100% {
      background: rgba(250, 204, 21, 0.4);
    }
  }

  .mine-panel {
    position: relative;
    overflow: visible;
    z-index: 1;
    width: 460px;
    padding: 14px 14px 18px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 2px solid #44403c;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
  }

  .nails {
    position: absolute;
    top: 6px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 1;
  }

  .nails-bottom {
    top: auto;
    bottom: 6px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .mine-btn {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    padding: 18px 32px;
    background: linear-gradient(180deg, #44403c 0%, #292524 40%, #1c1917 100%);
    border: 1.5px solid #57534e;
    border-top-color: #78716c;
    border-bottom-color: #44403c;
    border-radius: 6px;
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
    background: linear-gradient(180deg, #57534e 0%, #44403c 40%, #292524 100%);
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
    width: 42px;
    height: 42px;
    flex-shrink: 0;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .label-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1;
    gap: 5px;
  }

  .label-found {
    color: #fde047;
    font-size: 16px;
  }

  .sub-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #fef3c7;
    white-space: nowrap;
    opacity: 0.95;
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
</style>
