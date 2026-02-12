<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import type { AutomataRule, HSLColor } from '$lib/stores/automata.svelte';

  let { onclose }: { onclose: () => void } = $props();

  // --- Helpers ---
  function hslToHex(c: HSLColor): string {
    const h = c.h, s = c.s, l = c.l;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * Math.max(0, Math.min(1, color)))
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function hexToHsl(hex: string): HSLColor {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l, a: 1 };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
    return { h, s, l, a: 1 };
  }

  // Parse neighbor string like "x+1|y-2" into offset tuple
  function parseNeighborOffset(s: string): number[] {
    return s.split('|').map((part) => {
      const m = part.match(/[+-]\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
  }

  // --- Derived state ---
  let dim = $derived(automataStore.dimension);
  let viewer = $derived(automataStore.viewer);
  let rule = $derived(automataStore.rule);
  let radius = $derived(automataStore.neighborhoodRadius);
  let allNeighbors = $derived(automataStore.allNeighborsForRadius);
  let neighborEnabled = $derived(automataStore.neighborEnabled);
  let activeCount = $derived(neighborEnabled.filter(Boolean).length);
  let maxN = $derived(allNeighbors.length);
  let isWolfram = $derived(dim === 1 && radius === 1);

  // Grid size for neighborhood visualization
  let gridRadius = $derived(radius);
  let gridCols = $derived(dim === 1 ? 2 * gridRadius + 1 : 2 * gridRadius + 1);
  let cellSize = $derived(Math.max(14, Math.min(28, Math.floor(120 / gridCols))));

  // Parse all neighbor offsets for grid
  let neighborOffsets = $derived(allNeighbors.map(parseNeighborOffset));

  // Build grid layers for neighborhood visualization
  let gridLayers = $derived.by(() => {
    if (dim === 1) {
      // 1D: single row
      return [{ z: 0, cells: buildLayer1D() }];
    }
    if (dim === 2) {
      // 2D: single grid
      return [{ z: 0, cells: buildLayer2D(0) }];
    }
    // 3D: z-layer slices
    const layers: { z: number; cells: GridCell[][] }[] = [];
    for (let z = -gridRadius; z <= gridRadius; z++) {
      layers.push({ z, cells: buildLayer2D(z) });
    }
    return layers;
  });

  interface GridCell {
    x: number;
    y: number;
    isSelf: boolean;
    neighborIndex: number; // -1 if not a neighbor position
    enabled: boolean;
  }

  function buildLayer1D(): GridCell[][] {
    const row: GridCell[] = [];
    for (let x = -gridRadius; x <= gridRadius; x++) {
      const isSelf = x === 0;
      const ni = neighborOffsets.findIndex((o) => o[0] === x);
      row.push({ x, y: 0, isSelf, neighborIndex: ni, enabled: ni >= 0 && neighborEnabled[ni] });
    }
    return [row];
  }

  function buildLayer2D(z: number): GridCell[][] {
    const rows: GridCell[][] = [];
    for (let y = gridRadius; y >= -gridRadius; y--) {
      const row: GridCell[] = [];
      for (let x = -gridRadius; x <= gridRadius; x++) {
        const isSelf = x === 0 && y === 0 && z === 0;
        let ni = -1;
        if (dim === 2) {
          ni = neighborOffsets.findIndex((o) => o[0] === x && o[1] === y);
        } else {
          ni = neighborOffsets.findIndex((o) => o[0] === x && o[1] === y && o[2] === z);
        }
        row.push({ x, y, isSelf, neighborIndex: ni, enabled: ni >= 0 && neighborEnabled[ni] });
      }
      rows.push(row);
    }
    return rows;
  }

  // --- Rule toggle helpers ---
  function toggleBorn(n: number) {
    if (rule.type !== 'conway') return;
    const born = rule.born.includes(n)
      ? rule.born.filter((v) => v !== n)
      : [...rule.born, n].sort((a, b) => a - b);
    automataStore.setRule({ type: 'conway', survive: [...rule.survive], born });
  }

  function toggleSurvive(n: number) {
    if (rule.type !== 'conway') return;
    const survive = rule.survive.includes(n)
      ? rule.survive.filter((v) => v !== n)
      : [...rule.survive, n].sort((a, b) => a - b);
    automataStore.setRule({ type: 'conway', survive, born: [...rule.born] });
  }

  function setWolframRule(val: number) {
    const clamped = Math.max(0, Math.min(255, val));
    automataStore.setRule({ type: 'wolfram', rule: clamped });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="advanced-panel">
  <div class="nails">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>
  <div class="nails nails-bottom">
    <div class="nail"></div>
    <div class="nail"></div>
  </div>

  <!-- Header -->
  <div class="panel-header">
    <span class="panel-title">ADVANCED MODE</span>
    <button class="close-btn" onclick={onclose} aria-label="Close advanced panel">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </div>

  <!-- Body: 4-column grid -->
  <div class="panel-body">
    <!-- DIMENSIONS -->
    <div class="section">
      <div class="section-title">DIMENSIONS</div>

      <div class="field">
        <span class="field-label">Cell</span>
        <div class="toggle-row">
          {#each [1, 2, 3] as d}
            <button
              class="toggle-btn {dim === d ? 'active' : ''}"
              onclick={() => automataStore.setDimension(d as 1 | 2 | 3)}
            >{d}D</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Viewer</span>
        <div class="toggle-row">
          {#each [2, 3] as v}
            {@const valid = (dim === 1 && v === 2) || (dim === 2) || (dim === 3 && v === 3)}
            <button
              class="toggle-btn {viewer === v ? 'active' : ''} {!valid ? 'disabled' : ''}"
              onclick={() => valid && automataStore.setViewer(v as 2 | 3)}
              disabled={!valid}
            >{v}D</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Grid</span>
        <div class="grid-inputs">
          {#each Object.entries(automataStore.populationShape) as [key, val]}
            <div class="grid-input-wrap">
              <span class="grid-input-label">{key}</span>
              <input
                type="number"
                class="num-input"
                value={val}
                min="2"
                max="500"
                onchange={(e) => {
                  const v = parseInt((e.target as HTMLInputElement).value);
                  if (!isNaN(v) && v >= 2) {
                    automataStore.setPopulationShapeDimension(key, v);
                    automataStore.reset();
                  }
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- RULES -->
    <div class="section section-rules">
      <div class="section-title">RULES</div>

      <div class="field">
        <span class="field-label">Radius</span>
        <input
          type="number"
          class="num-input num-input-sm"
          value={radius}
          min="1"
          max="10"
          onchange={(e) => {
            const v = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(v)) automataStore.setNeighborhoodRadius(v);
          }}
        />
      </div>

      {#if isWolfram}
        <div class="field">
          <span class="field-label">Rule #</span>
          <input
            type="number"
            class="num-input num-input-sm"
            value={rule.type === 'wolfram' ? rule.rule : 0}
            min="0"
            max="255"
            onchange={(e) => setWolframRule(parseInt((e.target as HTMLInputElement).value))}
          />
        </div>
      {:else}
        <div class="field">
          <span class="field-label">Born</span>
          <div class="rule-toggles">
            {#each Array.from({ length: maxN + 1 }, (_, i) => i) as n}
              <button
                class="rule-btn {rule.type === 'conway' && rule.born.includes(n) ? 'active' : ''} {n > activeCount ? 'dimmed' : ''}"
                onclick={() => toggleBorn(n)}
              >{n}</button>
            {/each}
          </div>
        </div>
        <div class="field">
          <span class="field-label">Survive</span>
          <div class="rule-toggles">
            {#each Array.from({ length: maxN + 1 }, (_, i) => i) as n}
              <button
                class="rule-btn {rule.type === 'conway' && rule.survive.includes(n) ? 'active' : ''} {n > activeCount ? 'dimmed' : ''}"
                onclick={() => toggleSurvive(n)}
              >{n}</button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- NEIGHBORHOOD -->
    <div class="section">
      <div class="section-title">NEIGHBORHOOD</div>
      <div class="neighbor-count">{activeCount} / {maxN} active</div>

      <div class="neighbor-grid-wrap">
        {#each gridLayers as layer}
          {#if dim === 3}
            <div class="layer-label">z={layer.z}</div>
          {/if}
          <div class="neighbor-grid" style="--cell-size: {cellSize}px; --grid-cols: {gridCols};">
            {#each layer.cells as row}
              {#each row as cell}
                {#if cell.isSelf}
                  <div class="n-cell n-self" style="width: {cellSize}px; height: {cellSize}px;">
                    <span class="self-dot"></span>
                  </div>
                {:else if cell.neighborIndex >= 0}
                  <div
                    class="n-cell n-neighbor {cell.enabled ? 'n-on' : 'n-off'}"
                    style="width: {cellSize}px; height: {cellSize}px;"
                    onclick={() => automataStore.toggleNeighbor(cell.neighborIndex)}
                  ></div>
                {:else}
                  <div class="n-cell n-empty" style="width: {cellSize}px; height: {cellSize}px;"></div>
                {/if}
              {/each}
            {/each}
          </div>
        {/each}
      </div>

      <div class="neighbor-actions">
        <button class="small-btn" onclick={() => automataStore.setAllNeighborsEnabled(true)}>All On</button>
        <button class="small-btn" onclick={() => automataStore.setAllNeighborsEnabled(false)}>All Off</button>
      </div>
    </div>

    <!-- COLORS -->
    <div class="section">
      <div class="section-title">COLORS</div>
      {#each automataStore.cellStates as cs}
        <div class="color-row">
          <span class="color-label">{cs.number === 0 ? 'Dead' : 'Alive'}</span>
          <input
            type="color"
            class="color-input"
            value={hslToHex(cs.color)}
            oninput={(e) => {
              const hex = (e.target as HTMLInputElement).value;
              automataStore.setCellStateColor(cs.number, hexToHsl(hex));
            }}
          />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .advanced-panel {
    position: relative;
    margin: 0 1rem;
    padding: 16px 20px;
    padding-top: 56px;
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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: slide-down 0.25s ease-out;
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .nails {
    position: absolute;
    top: 7px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 7px;
  }

  .nail {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 4px rgba(103, 232, 249, 0.3);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .panel-title {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #a5f3fc;
    text-transform: uppercase;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .close-btn:hover {
    border-color: #67e8f9;
    color: #67e8f9;
  }

  .panel-body {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 20px 28px;
    align-items: start;
  }

  @media (max-width: 800px) {
    .panel-body {
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-rules {
    min-width: 0;
  }

  .section-title {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #78716c;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .toggle-row {
    display: flex;
    gap: 4px;
  }

  .toggle-btn {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: all 0.12s;
  }

  .toggle-btn:hover:not(.disabled) {
    border-color: #67e8f9;
    color: #cffafe;
  }

  .toggle-btn.active {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.15);
    color: #67e8f9;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.2);
  }

  .toggle-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .grid-inputs {
    display: flex;
    gap: 6px;
  }

  .grid-input-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .grid-input-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #78716c;
  }

  .num-input {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    width: 60px;
    padding: 3px 6px;
    border: 1px solid #44403c;
    border-radius: 4px;
    background: #0c0a09;
    color: #e7e5e4;
    outline: none;
    transition: border-color 0.15s;
  }

  .num-input:focus {
    border-color: #22d3ee;
  }

  .num-input-sm {
    width: 52px;
  }

  .rule-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .rule-btn {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    transition: all 0.12s;
  }

  .rule-btn:hover {
    border-color: #67e8f9;
  }

  .rule-btn.active {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.2);
    color: #67e8f9;
  }

  .rule-btn.dimmed {
    opacity: 0.35;
  }

  /* Neighborhood */
  .neighbor-count {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
  }

  .neighbor-grid-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: start;
  }

  .layer-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #78716c;
    width: 100%;
    margin-top: 4px;
  }

  .neighbor-grid {
    display: inline-grid;
    grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
    gap: 2px;
  }

  .n-cell {
    border-radius: 2px;
    transition: all 0.12s;
  }

  .n-self {
    background: #44403c;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .self-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #fbbf24;
  }

  .n-neighbor {
    cursor: pointer;
  }

  .n-on {
    background: rgba(34, 211, 238, 0.45);
    border: 1px solid #22d3ee;
  }

  .n-on:hover {
    background: rgba(34, 211, 238, 0.65);
  }

  .n-off {
    background: #292524;
    border: 1px solid #44403c;
  }

  .n-off:hover {
    background: #3a3530;
    border-color: #57534e;
  }

  .n-empty {
    background: transparent;
  }

  .neighbor-actions {
    display: flex;
    gap: 6px;
  }

  .small-btn {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    padding: 3px 8px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: #292524;
    color: #a8a29e;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.12s;
  }

  .small-btn:hover {
    border-color: #67e8f9;
    color: #cffafe;
  }

  /* Colors */
  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #a8a29e;
    min-width: 40px;
  }

  .color-input {
    width: 32px;
    height: 24px;
    border: 1px solid #44403c;
    border-radius: 3px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
</style>
