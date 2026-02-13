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
  import AchievementCard from '$lib/components/achievements/AchievementCard.svelte';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { achievementsStore } from '$lib/stores/achievements.svelte';

  const PAGE_SIZE = 20;

  type ChestTab = 'all' | 'claimed' | 'liked' | 'bookmarked' | 'achievements';

  const TABS: { id: ChestTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'claimed', label: 'Claimed' },
    { id: 'liked', label: 'Loved' },
    { id: 'bookmarked', label: 'Bookmarked' },
    { id: 'achievements', label: 'Achievements' },
  ];

  let activeTab: ChestTab = $state('all');
  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);
  let currentUserId = $state('');

  // Read initial tab from URL query param
  onMount(() => {
    const tabParam = $page.url.searchParams.get('tab') as ChestTab | null;
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      activeTab = tabParam;
    }
    if (activeTab !== 'achievements') {
      fetchItems(activeTab);
    }
    // Fetch achievements for the summary row + badge
    achievementsStore.fetch();
  });

  function switchTab(tab: ChestTab) {
    if (tab === activeTab) return;
    activeTab = tab;
    if (tab !== 'achievements') {
      fetchItems(tab);
    }
  }

  async function fetchItems(filter: string) {
    loading = true;
    items = [];
    hasMore = false;
    try {
      const result = await api<{ items: any[]; hasMore: boolean; currentUserId?: string }>(
        'GET',
        `/api/my-chest?filter=${filter}&limit=${PAGE_SIZE}&offset=0`
      );
      items = result.items;
      hasMore = result.hasMore;
      if (result.currentUserId) currentUserId = result.currentUserId;
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
      const result = await api<{ items: any[]; hasMore: boolean }>(
        'GET',
        `/api/my-chest?filter=${activeTab}&limit=${PAGE_SIZE}&offset=${items.length}`
      );
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
    const lattice = item.latticeType ?? undefined;

    const settings = { populationShape: shape, rule: rule!, cellStates, neighborhoodRadius, lattice };
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

  let earnedAchievements = $derived(
    achievementsStore.achievements.filter(a => a.earned)
  );
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
        {#each TABS as tab}
          <button
            class="tab"
            class:active={activeTab === tab.id}
            onclick={() => switchTab(tab.id)}
          >
            {tab.label}
            {#if tab.id === 'achievements' && achievementsStore.unseenCount > 0}
              <span class="badge">{achievementsStore.unseenCount}</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Tab content -->
      {#if activeTab === 'achievements'}
        <AchievementGrid />
      {:else}
        <!-- Achievements summary row (only on "all" tab) -->
        {#if activeTab === 'all' && earnedAchievements.length > 0}
          <div class="achievements-row">
            <div class="achievements-row-header">
              <span class="achievements-row-title">Achievements</span>
              <button class="achievements-row-link" onclick={() => switchTab('achievements')}>
                View all &rarr;
              </button>
            </div>
            <div class="achievements-row-icons">
              {#each earnedAchievements as a (a.def.id)}
                <AchievementCard achievement={a} />
              {/each}
            </div>
          </div>
        {/if}

        {#if items.length === 0 && !loading}
          <div class="flex h-40 items-center justify-center">
            <p class="empty-text">
              {#if activeTab === 'all'}
                No items yet. Start mining to fill your chest.
              {:else if activeTab === 'claimed'}
                No claims yet. Use the save button on the viewer to claim a configuration.
              {:else if activeTab === 'liked'}
                No loved items yet. Browse the gallery and love what you enjoy.
              {:else}
                No bookmarks yet. Use the chest button on cards to bookmark.
              {/if}
            </p>
          </div>
        {:else}
          <ExploreGrid {items} {loading} {hasMore} {currentUserId} onload={handleLoad} onloadmore={loadMore} />
        {/if}
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
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tab-bar::-webkit-scrollbar {
    display: none;
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
    padding: 10px 16px;
    cursor: pointer;
    transition: color 0.2s ease;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
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

  .empty-text {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #a8a29e;
    letter-spacing: 0.04em;
  }

  /* Achievements summary row */
  .achievements-row {
    margin-bottom: 28px;
    padding: 22px 24px;
    background: #1a1a1a;
    border: 1px solid #292524;
    border-radius: 10px;
  }

  .achievements-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .achievements-row-title {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .achievements-row-link {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #facc15;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .achievements-row-link:hover {
    color: #fde047;
  }

  .achievements-row-icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 12px;
  }
</style>
