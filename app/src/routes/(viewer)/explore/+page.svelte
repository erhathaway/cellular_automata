<script lang="ts">
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import ExploreFilters from '$lib/components/explore/ExploreFilters.svelte';

  const PAGE_SIZE = 20;

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  let filters = $state({
    type: 'all',
    dimension: '',
    sort: 'newest'
  });

  function buildParams(offset: number) {
    const params = new URLSearchParams();
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.dimension) params.set('dimension', filters.dimension);
    params.set('sort', filters.sort);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(offset));
    return params;
  }

  async function fetchItems() {
    loading = true;
    items = [];
    hasMore = false;
    try {
      const params = buildParams(0);
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/explore?${params.toString()}`);
      items = result.items;
      hasMore = result.hasMore;
    } catch {
      items = [];
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    try {
      const params = buildParams(items.length);
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/explore?${params.toString()}`);
      items = [...items, ...result.items];
      hasMore = result.hasMore;
    } catch {
      hasMore = false;
    } finally {
      loading = false;
    }
  }

  function handleFilterChange(newFilters: { type: string; dimension: string; sort: string }) {
    filters = newFilters;
    fetchItems();
  }

  async function handleLoad(item: any) {
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

    // Fetch seed on demand (not included in list responses for performance)
    if (item.entityType === 'generation_run') {
      try {
        const { seedPopulation } = await api<{ seedPopulation: string | null }>('GET', `/api/seed?id=${item.id}`);
        automataStore.savedSeed = seedPopulation ? base64ToUint8Array(seedPopulation) : null;
      } catch {
        automataStore.savedSeed = null;
      }
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

<div class="bg-white">
  <div class="mx-auto max-w-7xl px-6 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 style="font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #1c1917; margin: 0;">Gallery</h1>
    </div>

    <div class="mb-6">
      <ExploreFilters
        type={filters.type}
        dimension={filters.dimension}
        sort={filters.sort}
        onchange={handleFilterChange}
      />
    </div>

    <ExploreGrid {items} {loading} {hasMore} onload={handleLoad} onloadmore={loadMore} />
  </div>
</div>
