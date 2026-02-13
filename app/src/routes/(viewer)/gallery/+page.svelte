<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array, migrateCellStatesData } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import ExploreFilters from '$lib/components/explore/ExploreFilters.svelte';
  import TopClaims from '$lib/components/explore/TopClaims.svelte';
  import GalleryStats from '$lib/components/explore/GalleryStats.svelte';

  let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1440);

  const PAGE_SIZE = 20;
  const SESSION_KEY = 'explore-filters';

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  function loadFilters(): { type: string; dimension: string; sort: string; level: string; lattice: string } {
    const defaults = { type: 'all', dimension: '', sort: 'newest', level: '', lattice: '' };
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  }

  let filters = $state(loadFilters());

  function buildParams(offset: number) {
    const params = new URLSearchParams();
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.dimension) params.set('dimension', filters.dimension);
    if (filters.level) params.set('level', filters.level);
    if (filters.lattice) params.set('lattice', filters.lattice);
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

  function handleFilterChange(newFilters: { type: string; dimension: string; sort: string; level: string; lattice: string }) {
    filters = newFilters;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(newFilters)); } catch {}
    fetchItems();
  }

  async function handleLoad(item: any) {
    const dim = item.dimension;
    const viewer = item.viewer;
    const rule = deserializeRule(item.ruleDefinition);
    const shape = typeof item.populationShape === 'string' ? JSON.parse(item.populationShape) : item.populationShape;
    const rawCellStates = typeof item.cellStates === 'string' ? JSON.parse(item.cellStates) : item.cellStates;
    const cellStatesData = migrateCellStatesData(rawCellStates);
    const neighborhoodRadius = item.neighborhoodRadius ?? 1;
    const lattice = item.latticeType ?? undefined;

    const settings = { populationShape: shape, rule: rule!, cellStates: cellStatesData.states, trailConfig: cellStatesData.trail, neighborhoodRadius, lattice };
    if (rule) {
      automataStore.hydrateCombo(dim, viewer, settings);
    }
    automataStore.hydrateActive(dim, viewer);

    // Fetch seed on demand (not included in list responses for performance)
    if (item.entityType === 'generation_run') {
      automataStore.generationRunId = item.id;
      try {
        const { seedPopulation, claimPopulation } = await api<{ seedPopulation: string | null; claimPopulation: string | null }>('GET', `/api/seed?id=${item.id}`);
        const popToUse = claimPopulation ?? seedPopulation;
        automataStore.savedSeed = popToUse ? base64ToUint8Array(popToUse) : null;
      } catch {
        automataStore.savedSeed = null;
      }
    } else {
      automataStore.generationRunId = null;
      automataStore.savedSeed = null;
    }
    automataStore.useSavedSeed = true;
    automataStore.resetMiningToRandom();
    automataStore.reset();
    viewerUiStore.openAnalysis();
    const params = buildURLParams(dim, viewer, settings, undefined, automataStore.generationRunId);
    goto(`/mine?${params.toString()}`);
  }

  onMount(() => {
    fetchItems();
  });
</script>

<svelte:window bind:innerWidth={innerWidth} />
<div class="gallery-bg">
  <div class="mx-auto max-w-2xl px-6 md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
    <div class="sticky-filters sticky top-0 z-20 pb-4 pt-8">
      <div class="flex flex-wrap items-center gap-4">
        <h1 style="font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0;">Gallery</h1>
        <ExploreFilters
          type={filters.type}
          dimension={filters.dimension}
          sort={filters.sort}
          level={filters.level}
          lattice={filters.lattice}
          onchange={handleFilterChange}
        />
      </div>
    </div>

    {#if innerWidth < 1000}
      <div class="inline-stats">
        <GalleryStats />
      </div>
    {/if}

    <TopClaims onload={handleLoad} />

    <ExploreGrid {items} {loading} {hasMore} onload={handleLoad} onloadmore={loadMore} />
  </div>
</div>

<style>
  .gallery-bg {
    background: #000;
    min-height: 100%;
  }

  .inline-stats {
    margin-bottom: 20px;
  }

  .inline-stats :global(.stats-body) {
    flex-direction: row;
    height: auto;
    padding: 0;
    overflow: visible;
  }

  .inline-stats :global(.panel) {
    flex: 1;
    min-width: 0;
  }

  .inline-stats :global(.panel:first-child) {
    flex: 0 0 auto;
  }

  .inline-stats :global(.section-label) {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .sticky-filters {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    mask-image: linear-gradient(to bottom, black calc(100% - 8px), transparent);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 8px), transparent);
  }
</style>
