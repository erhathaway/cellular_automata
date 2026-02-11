<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import CompactCard from './CompactCard.svelte';
  import SkeletonCard from './SkeletonCard.svelte';

  let topRuns: any[] = $state([]);
  let topPopulations: any[] = $state([]);
  let loading = $state(true);

  async function fetchTop() {
    try {
      const result = await api<{ topRuns: any[]; topPopulations: any[] }>('GET', '/api/top');
      topRuns = result.topRuns;
      topPopulations = result.topPopulations;
    } catch {
      topRuns = [];
      topPopulations = [];
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

  onMount(fetchTop);
</script>

<div class="flex h-full flex-col overflow-y-auto px-3 py-4">
  {#if loading}
    <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
      Popular Runs
    </h3>
    <div class="mb-4 flex flex-col gap-0.5">
      {#each { length: 3 } as _}
        <SkeletonCard />
      {/each}
    </div>
    <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
      Popular Populations
    </h3>
    <div class="flex flex-col gap-0.5">
      {#each { length: 3 } as _}
        <SkeletonCard />
      {/each}
    </div>
  {:else}
    <!-- Popular Runs -->
    {#if topRuns.length > 0}
      <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Popular Runs
      </h3>
      <div class="mb-4 flex flex-col gap-0.5">
        {#each topRuns as item}
          <CompactCard {item} onclick={handleLoad} />
        {/each}
      </div>
    {/if}

    <!-- Popular Populations -->
    {#if topPopulations.length > 0}
      <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Popular Populations
      </h3>
      <div class="flex flex-col gap-0.5">
        {#each topPopulations as item}
          <CompactCard {item} onclick={handleLoad} />
        {/each}
      </div>
    {/if}

    {#if topRuns.length === 0 && topPopulations.length === 0}
      <p class="text-center text-xs text-neutral-400">No saved items yet</p>
    {/if}
  {/if}
</div>
