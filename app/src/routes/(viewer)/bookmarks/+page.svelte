<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { deserializeRule } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';

  let items: any[] = $state([]);
  let loading = $state(true);

  async function fetchMySaves() {
    loading = true;
    try {
      const result = await api<{ items: any[] }>('GET', '/api/my-saves');
      items = result.items;
    } catch {
      items = [];
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

  onMount(fetchMySaves);
</script>

<div class="h-full overflow-y-auto bg-white">
  <div class="mx-auto max-w-7xl px-6 py-8">
    <h1 class="mb-6 text-2xl font-bold text-black">My Saves</h1>

    <SignedOut>
      <div class="flex h-40 items-center justify-center">
        <p class="text-neutral-400">
          <a href="/sign-in" class="text-blue-600 hover:underline">Sign in</a> to save configurations
        </p>
      </div>
    </SignedOut>

    <SignedIn>
      {#if loading}
        <div class="flex h-40 items-center justify-center">
          <p class="text-neutral-400">Loading...</p>
        </div>
      {:else if items.length === 0}
        <div class="flex h-40 items-center justify-center">
          <p class="text-neutral-400">No saves yet. Use the save button on the viewer to save a configuration.</p>
        </div>
      {:else}
        <ExploreGrid {items} onload={handleLoad} />
      {/if}
    </SignedIn>
  </div>
</div>
