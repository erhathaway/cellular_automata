<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array, migrateCellStatesData } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';
  import AchievementGrid from '$lib/components/achievements/AchievementGrid.svelte';
  import AchievementCard from '$lib/components/achievements/AchievementCard.svelte';
  import { SignedIn, SignedOut, SignInButton } from 'svelte-clerk/client';
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
  const MAX_SLOTS = 300;
  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);
  let currentUserId = $state('');
  let totalClaims = $state(0);

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
      const result = await api<{ items: any[]; hasMore: boolean; currentUserId?: string; totalClaims?: number }>(
        'GET',
        `/api/my-chest?filter=${filter}&limit=${PAGE_SIZE}&offset=0`
      );
      items = result.items;
      hasMore = result.hasMore;
      if (result.currentUserId) currentUserId = result.currentUserId;
      if (result.totalClaims != null) totalClaims = result.totalClaims;
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

  let earnedAchievements = $derived(
    achievementsStore.achievements.filter(a => a.earned)
  );
</script>

<div class="chest-bg">
  <div class="mx-auto max-w-2xl px-6 md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
    <div class="sticky-top sticky top-0 z-20 pb-4 pt-8">
      <div class="backpack-header">
        <h1 class="backpack-title">Backpack</h1>
        <div class="capacity-section">
          <span class="capacity-text">
            Claim Capacity
            <span class="capacity-count">{totalClaims}</span>
            <span class="capacity-sep">/</span>
            <span class="capacity-max">{MAX_SLOTS}</span>
          </span>
          <div class="capacity-blocks">
            {#each Array(10) as _, i}
              {@const perBlock = MAX_SLOTS / 10}
              {@const blockClaims = Math.min(Math.max(totalClaims - i * perBlock, 0), perBlock)}
              <div class="cap-block" class:cap-block-full={blockClaims >= perBlock}>
                <div
                  class="cap-block-fill"
                  style="height: {(blockClaims / perBlock) * 100}%"
                ></div>
              </div>
            {/each}
          </div>
        </div>
      </div>

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
      </SignedIn>
    </div>

    <SignedOut>
      <div class="flex h-40 items-center justify-center">
        <p style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a8a29e; letter-spacing: 0.04em;">
          <SignInButton mode="modal" forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/mine'} asChild>
            {#snippet children({ signIn })}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span onclick={signIn} style="color: #facc15; text-decoration: underline; text-underline-offset: 2px; cursor: pointer;">Sign in</span>
            {/snippet}
          </SignInButton> to save configurations
        </p>
      </div>
    </SignedOut>

    <SignedIn>

      <!-- Tab content -->
      {#if activeTab === 'achievements'}
        <AchievementGrid />
      {:else}
        <!-- Achievements summary row (only on "all" tab) -->
        {#if activeTab === 'all' && earnedAchievements.length > 0}
          <div class="achievements-row">
            <div class="achievements-row-header">
              <span class="achievements-row-title">Achievements <span class="achievements-row-count">{earnedAchievements.length} / {achievementsStore.achievements.length}</span></span>
            </div>
            <div class="achievements-row-clip">
              <div class="achievements-row-icons">
                {#each earnedAchievements as a (a.def.id)}
                  <AchievementCard achievement={a} />
                {/each}
              </div>
              <div class="achievements-row-fade">
                <button class="achievements-row-link" onclick={() => switchTab('achievements')}>
                  View all achievements &rarr;
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if items.length === 0 && !loading}
          <div class="flex h-40 items-center justify-center">
            <p class="empty-text">
              {#if activeTab === 'all'}
                No items yet. Start mining to fill your backpack.
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
          <ExploreGrid {items} {loading} {hasMore} {currentUserId} dense onload={handleLoad} onloadmore={loadMore} />
        {/if}
      {/if}
    </SignedIn>
  </div>
</div>

<style>
  .sticky-top {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    mask-image: linear-gradient(to bottom, black calc(100% - 8px), transparent);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 8px), transparent);
  }

  .backpack-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .capacity-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    margin-right: 24px;
  }

  .backpack-title {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    margin: 0;
    white-space: nowrap;
  }

  .capacity-text {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #57534e;
  }

  .capacity-count {
    color: #facc15;
    margin-left: 6px;
  }

  .capacity-sep {
    color: #44403c;
    margin: 0 1px;
  }

  .capacity-max {
    color: #57534e;
  }

  .capacity-blocks {
    display: flex;
    gap: 4px;
    max-width: 280px;
  }

  .cap-block {
    width: 24px;
    height: 24px;
    background: #1a1a1a;
    border: 1px solid #292524;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .cap-block-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #facc15;
    border-radius: 0 0 3px 3px;
    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cap-block-full {
    border-color: #ca8a04;
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.15);
  }

  .cap-block-full .cap-block-fill {
    border-radius: 3px;
  }

  .chest-bg {
    background: #000;
    min-height: 100%;
  }

  .tab-bar {
    display: flex;
    gap: 0;
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

  .achievements-row-count {
    font-size: 16px;
    color: #57534e;
    margin-left: 8px;
  }

  .achievements-row-clip {
    position: relative;
    max-height: 220px;
    overflow: hidden;
  }

  .achievements-row-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent 0%, #1a1a1a 85%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 14px;
  }

  .achievements-row-link {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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
