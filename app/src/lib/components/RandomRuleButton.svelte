<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let mining = $derived(automataStore.isMining);
  let miningTimer: ReturnType<typeof setTimeout> | undefined;
  let miningKey = $state(0);

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
    automataStore.isMining = true;
    miningKey++;
    automataStore.randomizeRule();
    miningTimer = setTimeout(() => { automataStore.isMining = false; }, 5000);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="mine-btn {mining ? 'mining' : ''}" onclick={handleClick}>
  <!-- Corner nails -->
  <div class="nails">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <div class="nails nails-bottom">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>

  <svg xmlns="http://www.w3.org/2000/svg" class="pickaxe {mining ? 'pickaxe-strike' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
    <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
    <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
    <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
  </svg>

  <span class="label" class:label-hidden={mining}>Mine for automata</span>

  {#if mining && cells.length}
    <div class="ca-grid" style="--cols: {COLS}; --rows: {ROWS};">
      {#each cells as row}
        {#each row as cell}
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

<style>
  .mine-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 10px 18px;
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
    border-radius: 6px;
    color: #facc15;
    transition: border-color 0.15s, background-color 0.15s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
  }

  .mine-btn:hover {
    border-color: #facc15;
    background-color: #292524;
  }

  .mine-btn.mining {
    border-color: #facc15;
  }

  .nails {
    position: absolute;
    top: 5px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 5px;
  }

  .nail {
    width: 5px;
    height: 5px;
    background: #78716c;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
  }

  .pickaxe {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .label-hidden {
    visibility: hidden;
  }

  /* Mini CA grid overlaid where the label text is */
  .ca-grid {
    position: absolute;
    left: 48px;
    right: 18px;
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
    left: 18px;
    right: 18px;
    bottom: 6px;
    height: 3px;
    background: rgba(250, 204, 21, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #facc15;
    border-radius: 2px;
    animation: fill 5s linear forwards;
  }
</style>
