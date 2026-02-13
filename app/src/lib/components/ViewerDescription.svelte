<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import { api } from '$lib/api';
  import { getLattice, defaultLattice } from '$lib-core';
  import { historyStore } from '$lib/stores/history.svelte';
  import MinerBadge from './MinerBadge.svelte';
  import AutomataDetails from './AutomataDetails.svelte';

  let detailsItem = $derived.by(() => ({
    ruleDefinition: serializeRule(automataStore.rule),
    dimension: automataStore.dimension,
    neighborhoodRadius: automataStore.neighborhoodRadius,
    latticeType: automataStore.lattice,
  }));

  interface ShapeRuleDisplay {
    label: string;
    born: number[];
    survive: number[];
  }

  let fullRules = $derived.by((): ShapeRuleDisplay[] => {
    const lat = automataStore.lattice;
    const config = getLattice(lat);
    const sr = automataStore.shapeRules;
    const rule = automataStore.rule;

    if (config.shapes && sr) {
      return config.shapes.map((shape, i) => ({
        label: shape.label,
        born: sr[i].born,
        survive: sr[i].survive,
      }));
    }

    // Single-shape: use main rule
    if (rule.type === 'wolfram') return [];
    return [{
      label: config.label,
      born: rule.born,
      survive: rule.survive,
    }];
  });

  let title = $derived.by(() => {
    const dim = automataStore.dimension;
    const view = automataStore.viewer;
    const rule = automataStore.rule;
    const r = automataStore.neighborhoodRadius;
    const lat = automataStore.lattice;

    let name = `${dim}D ${getLattice(lat).label} r=${r}`;
    if (view === 3) name += ` (3D view)`;

    if (rule.type === 'wolfram') {
      return `${name} — Rule ${rule.rule}`;
    }
    const maxNums = 6;
    const bornStr = rule.born.length > maxNums
      ? rule.born.slice(0, maxNums).join(',') + '…'
      : rule.born.join(',');
    const surviveStr = rule.survive.length > maxNums
      ? rule.survive.slice(0, maxNums).join(',') + '…'
      : rule.survive.join(',');
    const nc = automataStore.neighbors.length;
    return `${name} (${nc}n) — B${bornStr}/S${surviveStr}`;
  });

  // Discovery lookup
  interface DiscoveryInfo {
    found: boolean;
    discoveredBy?: string;
    discoveredByImageUrl?: string | null;
    discoveredByAvatarId?: string | null;
    discoveredAt?: string;
    saveCount?: number;
    totalLikes?: number;
    totalBookmarks?: number;
    isLikedByMe?: boolean;
    isBookmarkedByMe?: boolean;
    entityId?: string | null;
    entityType?: 'generation_run' | 'cell_population' | null;
  }

  let discoveryInfo: DiscoveryInfo | null = $state(null);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;

  let liked = $state(false);
  let bookmarked = $state(false);
  let likeAnimating = $state(false);
  let bookmarkAnimating = $state(false);
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  let lastConfigKey = '';
  let checking = $derived(discoveryInfo === null);

  function entityBody() {
    if (!discoveryInfo?.entityId || !discoveryInfo.entityType) return null;
    return discoveryInfo.entityType === 'generation_run'
      ? { generationRunId: discoveryInfo.entityId }
      : { cellPopulationId: discoveryInfo.entityId };
  }

  function syncHistoryFlags(overrides?: { liked?: boolean; bookmarked?: boolean; claimed?: boolean }) {
    const rd = serializeRule(automataStore.rule);
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    historyStore.updateFlags(rd, dim, nr, {
      liked: overrides?.liked ?? liked,
      bookmarked: overrides?.bookmarked ?? bookmarked,
      ...(overrides?.claimed !== undefined ? { claimed: overrides.claimed } : {}),
    });
  }

  async function toggleLike() {
    const body = entityBody();
    if (!body) return;

    liked = !liked;
    if (liked) {
      likeAnimating = true;
      setTimeout(() => { likeAnimating = false; }, 500);
      try {
        await api('POST', '/api/likes', body);
        syncHistoryFlags();
      } catch {
        liked = false;
      }
    } else {
      try {
        await api('DELETE', '/api/likes', body);
        syncHistoryFlags();
      } catch {
        liked = true;
      }
    }
  }

  async function toggleBookmark() {
    const body = entityBody();
    if (!body) return;

    bookmarked = !bookmarked;
    if (bookmarked) {
      bookmarkAnimating = true;
      setTimeout(() => { bookmarkAnimating = false; }, 500);
      try {
        await api('POST', '/api/bookmarks', body);
        syncHistoryFlags();
      } catch {
        bookmarked = false;
      }
    } else {
      try {
        await api('DELETE', '/api/bookmarks', body);
        syncHistoryFlags();
      } catch {
        bookmarked = true;
      }
    }
  }

  // Reactively look up discovery info when config changes
  $effect(() => {
    const rule = automataStore.rule;
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    const lat = automataStore.lattice;
    const _claimed = automataStore.claimAnimationCounter;

    // Build query params
    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    // Reset state on actual config change
    const configKey = `${dim}:${ruleType}:${ruleDefinition}:${nr}:${lat}`;
    if (configKey !== lastConfigKey) {
      lastConfigKey = configKey;
      liked = false;
      bookmarked = false;
      discoveryInfo = null;
    }

    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          d: String(dim),
          rt: ruleType,
          rd: ruleDefinition,
          nr: String(nr),
          ...(lat !== defaultLattice(dim) ? { lt: lat } : {}),
        });
        const res = await fetch(`/api/discovery?${params}`);
        if (res.ok) {
          const data = await res.json();
          discoveryInfo = data;
          liked = data.isLikedByMe ?? false;
          bookmarked = data.isBookmarkedByMe ?? false;
          // Sync initial like/bookmark state + claimed status to history
          syncHistoryFlags({ claimed: data.found ? true : undefined });
        } else {
          discoveryInfo = null;
        }
      } catch {
        discoveryInfo = null;
      }
    }, 500);
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => { copied = false; }, 1500);
    } catch {
      // fallback
    }
  }

</script>

<div class="desc-root">
  <!-- Left column: Miner badge -->
  <div class="badge-col">
    <MinerBadge />
  </div>

  <!-- Center column: Title + Details -->
  <div class="content-col">
    <h1 class="title" title={title}>{title}</h1>
    <AutomataDetails item={detailsItem} hideOwner />

    {#if fullRules.length > 0}
      <div class="full-rules">
        {#each fullRules as shape}
          <div class="shape-rule">
            {#if fullRules.length > 1}
              <span class="shape-label">{shape.label}</span>
            {/if}
            <span class="rule-born">B<span class="rule-suffix">orn</span><span class="rule-sep">:</span> {shape.born.join(', ')}</span>
            <span class="rule-survive">S<span class="rule-suffix">urvive</span><span class="rule-sep">:</span> {shape.survive.join(', ')}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Right column: Action buttons -->
  <div class="action-buttons">
    <!-- Copy link -->
    <div class="action-col">
      <button
        class="action-btn {copied ? 'active' : ''} {copied ? 'action-pop' : ''}"
        aria-label="Copy link"
        onclick={copyLink}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if copied}
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        {/if}
      </button>
      <span class="action-label">{copied ? 'Copied!' : 'Link'}</span>
    </div>

    <!-- Like -->
    <div class="action-col">
      <button
        class="action-btn {liked ? 'active' : ''} {likeAnimating ? 'action-pop' : ''}"
        class:checking
        aria-label={liked ? 'Unlike' : 'Like'}
        onclick={toggleLike}
        disabled={checking}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if checking}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        {/if}
      </button>
      <span class="action-label">{discoveryInfo?.totalLikes || ''}</span>
    </div>

    <!-- Bookmark -->
    <div class="action-col">
      <button
        class="action-btn {bookmarked ? 'active' : ''} {bookmarkAnimating ? 'action-pop' : ''}"
        class:checking
        aria-label={bookmarked ? 'Remove from chest' : 'Add to chest'}
        onclick={toggleBookmark}
        disabled={checking}
      >
        <div class="btn-nails"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        <div class="btn-nails btn-nails-bottom"><div class="btn-nail"></div><div class="btn-nail"></div></div>
        {#if checking}
          <svg class="action-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        {:else}
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
            <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
            <line x1="4" y1="13" x2="20" y2="13" />
            <rect x="10" y="11" width="4" height="4" rx="1" />
          </svg>
        {/if}
      </button>
      <span class="action-label">{discoveryInfo?.totalBookmarks || ''}</span>
    </div>
  </div>
</div>

<style>
  .desc-root {
    display: flex;
    gap: 32px;
    max-width: 56rem;
    margin: 0 auto;
    padding: 40px 24px 40px;
  }

  .badge-col {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4px;
  }

  .content-col {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #a8a29e;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 8px;
  }

  .full-rules {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
  }

  .shape-rule {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
  }

  .shape-label {
    color: #a8a29e;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    min-width: 70px;
  }

  .rule-born {
    color: #facc15;
  }

  .rule-survive {
    color: #38bdf8;
  }

  .rule-suffix {
    opacity: 0.4;
  }

  .rule-sep {
    color: #78716c;
  }

  .action-buttons {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    gap: 10px;
    padding-top: 4px;
  }

  .action-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(68, 64, 60, 0.12) 8px,
        rgba(68, 64, 60, 0.12) 9px
      );
    border: 2px solid #44403c;
    border-radius: 6px;
    color: #a8a29e;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background-color 0.15s;
  }

  .action-btn:hover {
    border-color: #78716c;
    color: #fafaf9;
    background-color: #292524;
  }

  .action-btn.active {
    border-color: #facc15;
    color: #facc15;
  }

  .action-btn.active:hover {
    border-color: #facc15;
    color: #facc15;
    background-color: #292524;
  }

  .action-btn.checking {
    color: #57534e;
    cursor: default;
  }

  .action-btn.checking:hover {
    border-color: #44403c;
    color: #57534e;
    background-color: #1c1917;
  }

  .btn-nails {
    position: absolute;
    top: 3px;
    left: 5px;
    right: 5px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .btn-nails-bottom {
    top: auto;
    bottom: 3px;
  }

  .btn-nail {
    width: 4px;
    height: 4px;
    background: #57534e;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5);
  }

  .action-icon {
    width: 20px;
    height: 20px;
    transition: width 0.15s, height 0.15s;
  }

  .action-icon.spin {
    width: 16px;
    height: 16px;
    animation: spinner 1s linear infinite;
  }

  .action-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 400;
    color: #78716c;
    min-height: 14px;
  }

  @keyframes pop {
    0% { transform: scale(1); }
    30% { transform: scale(1.2); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  :global(.action-pop) {
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
