<script lang="ts">
  import { LEVELS } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';

  type Filters = { type: string; dimension: string; sort: string; level: string; lattice: string; minerId: string; minerName: string };

  let {
    type = 'all',
    dimension = '',
    sort = 'newest',
    level = '',
    lattice = '',
    minerId = '',
    minerName = '',
    onchange
  }: {
    type: string;
    dimension: string;
    sort: string;
    level: string;
    lattice: string;
    minerId: string;
    minerName: string;
    onchange: (filters: Filters) => void;
  } = $props();

  const latticeEntries = Object.entries(LATTICE_REGISTRY as Record<string, { label: string }>);

  function emit() {
    onchange({ type, dimension, sort, level, lattice, minerId, minerName });
  }

  function clearMiner() {
    minerId = '';
    minerName = '';
    emit();
  }
</script>

<div class="filter-bar">
  <!-- Type toggle -->
  <div class="toggle-group">
    {#each [['all', 'All'], ['generation_run', 'Runs'], ['cell_population', 'Seeds']] as [value, label]}
      <button
        class="toggle-btn"
        class:active={type === value}
        onclick={() => { type = value; emit(); }}
      >
        {label}
      </button>
    {/each}
  </div>

  <!-- Dimension filter -->
  <select class="filter-select" bind:value={dimension} onchange={emit}>
    <option value="">All Dims</option>
    <option value="1">1D</option>
    <option value="2">2D</option>
    <option value="3">3D</option>
  </select>

  <!-- Level filter -->
  <select class="filter-select" bind:value={level} onchange={emit}>
    <option value="">All Levels</option>
    {#each LEVELS as l}
      <option value={l.key}>{l.label}</option>
    {/each}
  </select>

  <!-- Lattice filter -->
  <select class="filter-select" bind:value={lattice} onchange={emit}>
    <option value="">All Lattices</option>
    {#each latticeEntries as [key, def]}
      <option value={key}>{def.label}</option>
    {/each}
  </select>

  <!-- Sort -->
  <select class="filter-select" bind:value={sort} onchange={emit}>
    <option value="newest">Newest</option>
    <option value="most_liked">Most Liked</option>
  </select>

  <!-- Miner filter chip -->
  {#if minerId}
    <button class="miner-chip" onclick={clearMiner}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>{minerName || 'Miner'}</span>
      <svg class="chip-x" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3l6 6M9 3l-6 6" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .toggle-group {
    display: flex;
    border: 2px solid #44403c;
    border-radius: 8px;
    overflow: hidden;
  }

  .toggle-btn {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    background: #1c1917;
    color: #78716c;
  }

  .toggle-btn:not(:last-child) {
    border-right: 1px solid #44403c;
  }

  .toggle-btn:hover {
    background: #292524;
    color: #d6d3d1;
  }

  .toggle-btn.active {
    background: #292524;
    color: #facc15;
  }

  .filter-select {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #a8a29e;
    background: #1c1917;
    border: 2px solid #44403c;
    border-radius: 8px;
    padding: 6px 28px 6px 12px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%2378716c' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .filter-select:hover {
    border-color: #57534e;
  }

  .filter-select:focus {
    outline: none;
    border-color: #facc15;
    box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.3);
  }

  .miner-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #facc15;
    background: rgba(250, 204, 21, 0.1);
    border: 2px solid rgba(250, 204, 21, 0.35);
    border-radius: 20px;
    padding: 5px 10px 5px 12px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .miner-chip:hover {
    background: rgba(250, 204, 21, 0.18);
    border-color: #facc15;
  }

  .chip-x {
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .miner-chip:hover .chip-x {
    opacity: 1;
  }
</style>
