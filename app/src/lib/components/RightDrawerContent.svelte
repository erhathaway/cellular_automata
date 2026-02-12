<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
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
    automataStore.reset();
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

<div class="flex h-full flex-col overflow-y-auto px-3 py-4">
  <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
    Popular
  </h3>

  {#if items.length === 0 && !loading}
    <p class="text-center text-xs text-neutral-400">No saved items yet</p>
  {:else}
    <div class="flex flex-col gap-0.5">
      {#each items as item (item.id)}
        <CompactCard {item} onclick={handleLoad} />
      {/each}

      {#if loading}
        {#each { length: 3 } as _}
          <SkeletonCard />
        {/each}
      {/if}
    </div>

    <div bind:this={endEl} class="h-1"></div>
  {/if}
</div>
