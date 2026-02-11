<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';

  const PAGE_SIZE = 20;

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  async function fetchMySaves() {
    loading = true;
    items = [];
    hasMore = false;
    try {
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/my-saves?limit=${PAGE_SIZE}&offset=0`);
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
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/my-saves?limit=${PAGE_SIZE}&offset=${items.length}`);
      items = [...items, ...result.items];
      hasMore = result.hasMore;
    } catch {
      hasMore = false;
    } finally {
      loading = false;
    }
  }

  function handleLoad(item: any) {
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

  onMount(fetchMySaves);
</script>

<div class="h-full overflow-y-auto bg-white">
  <div class="mx-auto max-w-7xl px-6 py-8">
    <h1 class="mb-6 text-2xl font-bold text-black">My Chest</h1>

    <SignedOut>
      <div class="flex h-40 items-center justify-center">
        <p class="text-neutral-400">
          <a href="/sign-in" class="text-blue-600 hover:underline">Sign in</a> to save configurations
        </p>
      </div>
    </SignedOut>

    <SignedIn>
      {#if items.length === 0 && !loading}
        <div class="flex h-40 items-center justify-center">
          <p class="text-neutral-400">No saves yet. Use the save button on the viewer to save a configuration.</p>
        </div>
      {:else}
        <ExploreGrid {items} {loading} {hasMore} onload={handleLoad} onloadmore={loadMore} />
      {/if}
    </SignedIn>
  </div>
</div>
