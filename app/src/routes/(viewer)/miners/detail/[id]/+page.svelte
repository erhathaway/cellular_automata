<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array, migrateCellStatesData } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import UserStats from '$lib/components/UserStats.svelte';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';

  let { data } = $props();

  const PAGE_SIZE = 20;

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  async function fetchItems() {
    loading = true;
    items = [];
    hasMore = false;
    try {
      const params = new URLSearchParams();
      params.set('userId', data.profile.id);
      params.set('sort', 'newest');
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', '0');
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/explore?${params.toString()}`);
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
      const params = new URLSearchParams();
      params.set('userId', data.profile.id);
      params.set('sort', 'newest');
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(items.length));
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/explore?${params.toString()}`);
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

  onMount(() => {
    fetchItems();
  });
</script>

<div class="miner-page">
  <div class="mx-auto max-w-7xl px-6 pt-8 pb-16">
    <!-- Back link -->
    <a href="/gallery" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Gallery
    </a>

    <!-- Hero row -->
    <div class="hero">
      <!-- Left: Avatar -->
      <div class="hero-avatar">
        <div class="avatar-frame">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="avatar-inner">
            <PixelAvatar
              avatarId={data.profile.avatarId}
              size={360}
              fallbackInitials={(data.profile.displayName ?? '?')[0]}
              minerConfig={data.profile.minerConfig}
            />
          </div>
        </div>
        <div class="hero-name">{data.profile.displayName ?? 'Anonymous'}</div>
        <div class="hero-joined">Joined {timeAgo(data.profile.createdAt)}</div>
      </div>

      <!-- Right: Stats -->
      <div class="hero-stats">
        <UserStats stats={data.stats} />
      </div>
    </div>

    <!-- Claims section -->
    <div class="claims-section">
      <div class="section-header">
        <span class="section-title">Claims</span>
      </div>
      <ExploreGrid {items} {loading} {hasMore} currentUserId={data.profile.id} onload={handleLoad} onloadmore={loadMore} />
    </div>
  </div>
</div>

<style>
  .miner-page {
    background: #000;
    min-height: 100%;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #78716c;
    text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.2s ease;
  }

  .back-link:hover {
    color: #facc15;
  }

  /* Hero */
  .hero {
    display: flex;
    gap: 40px;
    margin-bottom: 48px;
  }

  .hero-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .avatar-frame {
    position: relative;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 10px,
        rgba(68, 64, 60, 0.1) 10px,
        rgba(68, 64, 60, 0.1) 11px
      );
    border: 1px solid #44403c;
    border-radius: 8px;
    padding: 24px;
    width: 340px;
    height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #d6d3d1;
    margin-top: 16px;
    text-align: center;
  }

  .hero-joined {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #78716c;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }

  /* Stats column */
  .hero-stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  /* Claims section */
  .claims-section {
    margin-top: 8px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .avatar-frame {
      width: 260px;
      height: 260px;
    }
  }
</style>
