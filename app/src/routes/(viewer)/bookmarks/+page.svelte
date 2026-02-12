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
  import AchievementIcon from '$lib/components/achievements/AchievementIcon.svelte';
  import { SignedIn, SignedOut } from 'svelte-clerk/client';
  import { achievementsStore } from '$lib/stores/achievements.svelte';
  import { ACHIEVEMENT_CATEGORIES } from '$lib/achievements/config';
  import { timeAgo } from '$lib/utils/timeAgo';

  const categoryLabelMap = new Map(ACHIEVEMENT_CATEGORIES.map(c => [c.id, c.label]));

  const PAGE_SIZE = 20;

  type ChestTab = 'all' | 'claimed' | 'liked' | 'bookmarked' | 'achievements';

  const TABS: { id: ChestTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'claimed', label: 'Claimed' },
    { id: 'liked', label: 'Liked' },
    { id: 'bookmarked', label: 'Bookmarked' },
    { id: 'achievements', label: 'Achievements' },
  ];

  let activeTab: ChestTab = $state('all');
  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

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
      const result = await api<{ items: any[]; hasMore: boolean }>(
        'GET',
        `/api/my-chest?filter=${filter}&limit=${PAGE_SIZE}&offset=0`
      );
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
                <div class="earned-chip" title={a.def.name}>
                  <!-- Outer corner brackets -->
                  <span class="ec-corner ec-tl"></span>
                  <span class="ec-corner ec-tr"></span>
                  <span class="ec-corner ec-bl"></span>
                  <span class="ec-corner ec-br"></span>
                  <!-- Inner corner brackets -->
                  <span class="ec-corner-inner ec-tl"></span>
                  <span class="ec-corner-inner ec-tr"></span>
                  <span class="ec-corner-inner ec-bl"></span>
                  <span class="ec-corner-inner ec-br"></span>
                  <!-- Electric edges -->
                  <span class="ec-edge ec-edge-top"></span>
                  <span class="ec-edge ec-edge-bottom"></span>
                  <span class="ec-edge ec-edge-left"></span>
                  <span class="ec-edge ec-edge-right"></span>

                  <span class="earned-chip-category">{categoryLabelMap.get(a.def.category) ?? a.def.category}</span>
                  <AchievementIcon icon={a.def.icon} size={44} />
                  <div class="earned-chip-text">
                    <span class="earned-chip-name">{a.def.name}</span>
                    <span class="earned-chip-desc">{a.def.description}</span>
                    {#if a.earnedAt}
                      <span class="earned-chip-date">{timeAgo(a.earnedAt)}</span>
                    {/if}
                  </div>
                </div>
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
                No likes yet. Browse the gallery and like what you enjoy.
              {:else}
                No bookmarks yet. Use the chest button on cards to bookmark.
              {/if}
            </p>
          </div>
        {:else}
          <ExploreGrid {items} {loading} {hasMore} onload={handleLoad} onloadmore={loadMore} />
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

  .earned-chip {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px 16px 16px;
    background: #1c1917;
    border: 1px solid #44403c;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    overflow: visible;
  }

  /* Outer corner brackets — thick gold L-shapes */
  .ec-corner {
    position: absolute;
    width: 14px;
    height: 14px;
    z-index: 3;
    pointer-events: none;
  }
  .ec-corner.ec-tl { top: -1px; left: -1px; border-top: 3px solid #facc15; border-left: 3px solid #facc15; border-top-left-radius: 4px; }
  .ec-corner.ec-tr { top: -1px; right: -1px; border-top: 3px solid #facc15; border-right: 3px solid #facc15; border-top-right-radius: 4px; }
  .ec-corner.ec-bl { bottom: -1px; left: -1px; border-bottom: 3px solid #facc15; border-left: 3px solid #facc15; border-bottom-left-radius: 4px; }
  .ec-corner.ec-br { bottom: -1px; right: -1px; border-bottom: 3px solid #facc15; border-right: 3px solid #facc15; border-bottom-right-radius: 4px; }

  /* Inner corner brackets — dark inset */
  .ec-corner-inner {
    position: absolute;
    width: 18px;
    height: 18px;
    z-index: 4;
    pointer-events: none;
  }
  .ec-corner-inner.ec-tl { top: 2px; left: 2px; border-top: 2.5px solid #1c1917; border-left: 2.5px solid #1c1917; border-top-left-radius: 2px; }
  .ec-corner-inner.ec-tr { top: 2px; right: 2px; border-top: 2.5px solid #1c1917; border-right: 2.5px solid #1c1917; border-top-right-radius: 2px; }
  .ec-corner-inner.ec-bl { bottom: 2px; left: 2px; border-bottom: 2.5px solid #1c1917; border-left: 2.5px solid #1c1917; border-bottom-left-radius: 2px; }
  .ec-corner-inner.ec-br { bottom: 2px; right: 2px; border-bottom: 2.5px solid #1c1917; border-right: 2.5px solid #1c1917; border-bottom-right-radius: 2px; }

  /* Electric edges between corners */
  .ec-edge {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    opacity: 0.45;
    filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
  }
  .ec-edge-top, .ec-edge-bottom {
    left: 14px;
    right: 14px;
    height: 2px;
    background: repeating-linear-gradient(90deg, #facc15 0px, #facc15 3px, transparent 3px, transparent 7px);
    background-size: 14px 2px;
    animation: ec-electric-h 0.6s linear infinite;
  }
  .ec-edge-top { top: 0; }
  .ec-edge-bottom { bottom: 0; }
  .ec-edge-left, .ec-edge-right {
    top: 14px;
    bottom: 14px;
    width: 2px;
    background: repeating-linear-gradient(180deg, #facc15 0px, #facc15 3px, transparent 3px, transparent 7px);
    background-size: 2px 14px;
    animation: ec-electric-v 0.6s linear infinite;
  }
  .ec-edge-left { left: 0; }
  .ec-edge-right { right: 0; }

  .earned-chip:hover .ec-edge {
    opacity: 0.85;
    filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.6));
  }

  @keyframes ec-electric-h {
    0% { background-position: 0 0; }
    100% { background-position: 14px 0; }
  }
  @keyframes ec-electric-v {
    0% { background-position: 0 0; }
    100% { background-position: 0 14px; }
  }

  .earned-chip-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .earned-chip-text .earned-chip-date {
    margin-top: 6px;
  }

  .earned-chip-name {
    font-family: 'Space Mono', monospace;
    font-size: 15px;
    font-weight: 700;
    color: #facc15;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .earned-chip-category {
    position: absolute;
    top: 6px;
    right: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .earned-chip-desc {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #a8a29e;
    line-height: 1.4;
    margin: 6px 0;
  }

  .earned-chip-date {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #d6d3d1;
    white-space: nowrap;
  }
</style>
