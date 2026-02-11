<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import CompactCard from './CompactCard.svelte';

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

    if (rule) {
      automataStore.hydrateCombo(dim, viewer, {
        populationShape: shape,
        rule,
        cellStates
      });
    }
    automataStore.hydrateActive(dim, viewer);
    automataStore.reset();
    goto('/');
  }

  onMount(fetchTop);
</script>

<div class="flex h-full flex-col overflow-y-auto px-3 py-4">
  {#if loading}
    <p class="text-center text-xs text-white/40">Loading...</p>
  {:else}
    <!-- Popular Runs -->
    {#if topRuns.length > 0}
      <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
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
      <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
        Popular Populations
      </h3>
      <div class="flex flex-col gap-0.5">
        {#each topPopulations as item}
          <CompactCard {item} onclick={handleLoad} />
        {/each}
      </div>
    {/if}

    {#if topRuns.length === 0 && topPopulations.length === 0}
      <p class="text-center text-xs text-white/40">No saved items yet</p>
    {/if}
  {/if}
</div>
