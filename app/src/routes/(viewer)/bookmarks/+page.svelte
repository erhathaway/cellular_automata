<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import AchievementGrid from '$lib/components/achievements/AchievementGrid.svelte';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { achievementsStore } from '$lib/stores/achievements.svelte';

  const PAGE_SIZE = 20;

  let activeTab: 'saves' | 'achievements' = $state('saves');
  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  // Read initial tab from URL query param
  onMount(() => {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'achievements') {
      activeTab = 'achievements';
    }
    fetchMySaves();
  });

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
    automataStore.resetMiningToRandom();
    automataStore.reset();
    viewerUiStore.openAnalysis();
    const params = buildURLParams(dim, viewer, settings);
    goto(`/?${params.toString()}`);
  }
</script>

<div class="chest-bg">
  <div class="mx-auto max-w-7xl px-6 py-8">
    <h1 style="font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 24px;">My Chest</h1>

    <SignedOut>
      <div class="flex h-40 items-center justify-center">
        <p style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a8a29e; letter-spacing: 0.04em;">
          <a href="/sign-in" style="color: #facc15; text-decoration: underline; text-underline-offset: 2px;">Sign in</a> to save configurations
        </p>
      </div>
    </SignedOut>

    <SignedIn>
      <!-- Tab bar -->
      <div class="tab-bar">
        <button
          class="tab"
          class:active={activeTab === 'saves'}
          onclick={() => { activeTab = 'saves'; }}
        >
          Saves
        </button>
        <button
          class="tab"
          class:active={activeTab === 'achievements'}
          onclick={() => { activeTab = 'achievements'; }}
        >
          Achievements
          {#if achievementsStore.unseenCount > 0}
            <span class="badge">{achievementsStore.unseenCount}</span>
          {/if}
        </button>
      </div>

      <!-- Tab content -->
      {#if activeTab === 'saves'}
        {#if items.length === 0 && !loading}
          <div class="flex h-40 items-center justify-center">
            <p style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a8a29e; letter-spacing: 0.04em;">No saves yet. Use the save button on the viewer to save a configuration.</p>
          </div>
        {:else}
          <ExploreGrid {items} {loading} {hasMore} onload={handleLoad} onloadmore={loadMore} />
        {/if}
      {:else}
        <AchievementGrid />
      {/if}
    </SignedIn>
  </div>
</div>

<style>
  .chest-bg {
    background: #000;
    min-height: 100%;
  }

  .tab-bar {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border-bottom: 1px solid #292524;
  }

  .tab {
    position: relative;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    background: none;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    transition: color 0.2s ease;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }

  .tab:hover {
    color: #a8a29e;
  }

  .tab.active {
    color: #facc15;
    border-bottom-color: #facc15;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 9px;
    font-weight: 700;
    color: #000;
    background: #facc15;
    border-radius: 8px;
    margin-left: 6px;
  }
</style>
