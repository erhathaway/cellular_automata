<script lang="ts">
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import ExploreFilters from '$lib/components/explore/ExploreFilters.svelte';

  let items: any[] = $state([]);
  let loading = $state(true);

  let filters = $state({
    type: 'all',
    dimension: '',
    sort: 'newest'
  });

  async function fetchItems() {
    loading = true;
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.dimension) params.set('dimension', filters.dimension);
      params.set('sort', filters.sort);
      params.set('limit', '40');

      const result = await api<{ items: any[] }>('GET', `/api/explore?${params.toString()}`);
      items = result.items;
    } catch {
      items = [];
    } finally {
      loading = false;
    }
  }

  function handleFilterChange(newFilters: { type: string; dimension: string; sort: string }) {
    filters = newFilters;
    fetchItems();
  }

  function handleLoad(item: any) {
    // Parse the item's config and hydrate into the store
    const dim = item.dimension;
    const viewer = item.viewer;
    const rule = deserializeRule(item.ruleDefinition);
    const shape = typeof item.populationShape === 'string' ? JSON.parse(item.populationShape) : item.populationShape;
    const cellStates = typeof item.cellStates === 'string' ? JSON.parse(item.cellStates) : item.cellStates;
    const neighborhoodRadius = item.neighborhoodRadius ?? 1;

    const settings = { populationShape: shape, rule: rule!, cellStates, neighborhoodRadius };
    if (rule) {
      automataStore.hydrateCombo(dim, viewer, settings);
    }
    automataStore.hydrateActive(dim, viewer);
    if (item.seedPopulation) {
      automataStore.savedSeed = base64ToUint8Array(item.seedPopulation);
    } else {
      automataStore.savedSeed = null;
    }
    automataStore.useSavedSeed = true;
    automataStore.reset();
    const params = buildURLParams(dim, viewer, settings);
    goto(`/?${params.toString()}`);
  }

  // Initial fetch
  $effect(() => {
    fetchItems();
  });
</script>

<div class="h-full overflow-y-auto bg-white">
  <div class="mx-auto max-w-7xl px-6 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-black">Explore</h1>
    </div>

    <div class="mb-6">
      <ExploreFilters
        type={filters.type}
        dimension={filters.dimension}
        sort={filters.sort}
        onchange={handleFilterChange}
      />
    </div>

    {#if loading}
      <div class="flex h-40 items-center justify-center">
        <p class="text-neutral-400">Loading...</p>
      </div>
    {:else}
      <ExploreGrid {items} onload={handleLoad} />
    {/if}
  </div>
</div>
