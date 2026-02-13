<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import CompactCard from './CompactCard.svelte';
  import SkeletonCard from './SkeletonCard.svelte';

  const PAGE_SIZE = 20;

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);
  let endEl = $state<HTMLElement>();

  async function fetchTop() {
    loading = true;
    items = [];
    hasMore = false;
    try {
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/top?limit=${PAGE_SIZE}&offset=0`);
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
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/top?limit=${PAGE_SIZE}&offset=${items.length}`);
      items = [...items, ...result.items];
      hasMore = result.hasMore;
    } catch {
      hasMore = false;
    } finally {
      loading = false;
    }
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
    automataStore.resetMiningToRandom();
    automataStore.reset();
    viewerUiStore.openAnalysis();
    const params = buildURLParams(dim, viewer, settings);
    goto(`/?${params.toString()}`);
  }

  // Poll-based infinite scroll
  onMount(() => {
    fetchTop();
    const id = setInterval(() => {
      if (!endEl || loading || !hasMore) return;
      const rect = endEl.getBoundingClientRect();
      if (rect.top < window.innerHeight + 800) {
        loadMore();
      }
    }, 200);
    return () => clearInterval(id);
  });
</script>

<div class="drawer-content">
  <div class="drawer-header">
    <div class="header-left">
      <!-- Gem / crystal icon -->
      <svg class="gem-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
        <polyline points="2 15.5 12 8.5 22 15.5" />
        <line x1="12" y1="2" x2="12" y2="8.5" />
      </svg>
      <span class="header-title">POPULAR FINDS</span>
    </div>
    {#if items.length > 0}
      <span class="count-badge">{items.length}{hasMore ? '+' : ''}</span>
    {/if}
  </div>

  {#if items.length === 0 && !loading}
    <div class="empty-state">
      <svg class="empty-gem" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
        <polyline points="2 15.5 12 8.5 22 15.5" />
        <line x1="12" y1="2" x2="12" y2="8.5" />
      </svg>
      <p class="empty-text">No finds yet</p>
    </div>
  {:else}
    <div class="card-list">
      {#each items as item (item.id)}
        <CompactCard {item} onclick={handleLoad} interactive />
      {/each}

      {#if loading}
        {#each { length: 3 } as _}
          <SkeletonCard />
        {/each}
      {/if}
    </div>

    <div bind:this={endEl} class="scroll-sentinel"></div>
  {/if}
</div>

<style>
  .drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 16px 12px;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .gem-icon {
    color: #facc15;
    filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
  }

  .header-title {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #44403c;
    text-transform: uppercase;
  }

  .count-badge {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #facc15;
    background: #292524;
    padding: 2px 7px;
    border-radius: 10px;
    letter-spacing: 0.04em;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scroll-sentinel {
    height: 1px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding-top: 48px;
  }

  .empty-gem {
    color: #d6d3d1;
  }

  .empty-text {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #a8a29e;
    letter-spacing: 0.06em;
    margin: 0;
  }
</style>
