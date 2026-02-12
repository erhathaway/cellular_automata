<script lang="ts">
  let {
    type = 'all',
    dimension = '',
    sort = 'newest',
    onchange
  }: {
    type: string;
    dimension: string;
    sort: string;
    onchange: (filters: { type: string; dimension: string; sort: string }) => void;
  } = $props();

  function emit() {
    onchange({ type, dimension, sort });
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
    <option value="">All Dimensions</option>
    <option value="1">1D</option>
    <option value="2">2D</option>
    <option value="3">3D</option>
  </select>

  <!-- Sort -->
  <select class="filter-select" bind:value={sort} onchange={emit}>
    <option value="newest">Newest</option>
    <option value="most_liked">Most Liked</option>
  </select>
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
    border: 2px solid #292524;
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
    background: white;
    color: #78716c;
  }

  .toggle-btn:not(:last-child) {
    border-right: 1px solid #d6d3d1;
  }

  .toggle-btn:hover {
    background: #f5f5f4;
    color: #1c1917;
  }

  .toggle-btn.active {
    background: #1c1917;
    color: #facc15;
  }

  .filter-select {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #44403c;
    background: white;
    border: 2px solid #292524;
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
    border-color: #44403c;
  }

  .filter-select:focus {
    outline: none;
    border-color: #facc15;
    box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.3);
  }
</style>
