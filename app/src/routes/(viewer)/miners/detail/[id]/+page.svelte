<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';
  import { viewerUiStore } from '$lib/stores/viewer-ui.svelte';
  import { deserializeRule, buildURLParams, base64ToUint8Array } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import ExploreGrid from '$lib/components/explore/ExploreGrid.svelte';

  let { data } = $props();

  const PAGE_SIZE = 20;

  let items: any[] = $state([]);
  let loading = $state(true);
  let hasMore = $state(false);

  // Stats derivations
  let levelData = $derived.by(() => {
    const agg = aggregateByLevel(data.stats.byRadius);
    return LEVELS.map(l => ({ key: l.key, label: l.label, count: agg[l.key] ?? 0 }));
  });

  let maxLevel = $derived.by(() => {
    const m = Math.max(...levelData.map(d => d.count));
    return m > 0 ? m : 1;
  });

  let latticeData = $derived.by(() => {
    return Object.entries(data.stats.byLattice)
      .map(([type, count]) => ({
        type,
        label: (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type,
        count
      }))
      .sort((a, b) => b.count - a.count);
  });

  let maxLattice = $derived.by(() => {
    const m = Math.max(...latticeData.map(d => d.count));
    return m > 0 ? m : 1;
  });

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
    automataStore.resetMiningToRandom();
    automataStore.reset();
    viewerUiStore.openAnalysis();
    const params = buildURLParams(dim, viewer, settings);
    goto(`/?${params.toString()}`);
  }

  onMount(() => {
    fetchItems();
  });
</script>

<div class="miner-page">
  <div class="mx-auto max-w-7xl px-6 pt-8 pb-16">
    <!-- Back link -->
    <a href="/explore" class="back-link">
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
        <!-- Total Claims -->
        <div class="panel">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="section-label">Total Claims</div>
          <div class="claims-row">
            <svg class="claims-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9Z" />
              <path d="M11 3 8 9l4 13 4-13-3-6" />
              <path d="M2 9h20" />
            </svg>
            <span class="total-value">{data.stats.claimCount.toLocaleString()}</span>
          </div>
        </div>

        <!-- Level Distribution -->
        <div class="panel">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="section-label">Level Distribution</div>
          <div class="hbar-list">
            {#each levelData as d (d.key)}
              <div class="hbar-row">
                <div class="hbar-name">{d.label}</div>
                <div class="hbar-track">
                  <div
                    class="hbar-fill"
                    style="width: {Math.max(2, (d.count / maxLevel) * 100)}%;"
                  ></div>
                </div>
                <div class="hbar-count">{d.count}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Lattice Distribution -->
        {#if latticeData.length > 0}
          <div class="panel">
            <div class="nails"><div class="nail"></div><div class="nail"></div></div>
            <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
            <div class="section-label">Lattice Distribution</div>
            <div class="hbar-list">
              {#each latticeData as d (d.type)}
                <div class="hbar-row">
                  <div class="hbar-name">{d.label}</div>
                  <div class="hbar-track">
                    <div
                      class="hbar-fill"
                      style="width: {Math.max(2, (d.count / maxLattice) * 100)}%;"
                    ></div>
                  </div>
                  <div class="hbar-count">{d.count}</div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
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

  /* Panel (matches GalleryStats) */
  .panel {
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
    padding: 20px 16px;
  }

  .nails {
    position: absolute;
    top: 8px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 8px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
    margin-bottom: 10px;
  }

  .claims-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .claims-icon {
    flex-shrink: 0;
  }

  .total-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #fef08a;
  }

  /* Horizontal bar chart (matches GalleryStats) */
  .hbar-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .hbar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hbar-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #d6d3d1;
    width: 68px;
    flex-shrink: 0;
  }

  .hbar-track {
    flex: 1;
    height: 16px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid #44403c;
    overflow: hidden;
  }

  .hbar-fill {
    height: 100%;
    background: linear-gradient(90deg, #facc15 0%, #fde047 100%);
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .hbar-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #d6d3d1;
    width: 36px;
    text-align: right;
    flex-shrink: 0;
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
