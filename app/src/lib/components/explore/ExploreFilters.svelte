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

<div class="flex flex-wrap items-center gap-3">
  <!-- Type toggle -->
  <div class="flex rounded-lg bg-neutral-100 p-0.5">
    {#each [['all', 'All'], ['generation_run', 'Runs'], ['cell_population', 'Populations']] as [value, label]}
      <button
        class="rounded-md px-3 py-1 text-sm font-medium transition-colors {type === value ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}"
        onclick={() => { type = value; emit(); }}
      >
        {label}
      </button>
    {/each}
  </div>

  <!-- Dimension filter -->
  <select
    bind:value={dimension}
    onchange={emit}
    class="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-black"
  >
    <option value="">All Dimensions</option>
    <option value="1">1D</option>
    <option value="2">2D</option>
    <option value="3">3D</option>
  </select>

  <!-- Sort -->
  <select
    bind:value={sort}
    onchange={emit}
    class="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-black"
  >
    <option value="newest">Newest</option>
    <option value="most_liked">Most Liked</option>
  </select>
</div>
