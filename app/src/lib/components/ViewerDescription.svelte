<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import { getLattice, defaultLattice } from '$lib-core';
  import { historyStore } from '$lib/stores/history.svelte';
  import MinerBadge from './MinerBadge.svelte';
  import AutomataDetails from './AutomataDetails.svelte';
  import ActionButtons from './ActionButtons.svelte';

  let { compact = false }: { compact?: boolean } = $props();

  let detailsItem = $derived.by(() => ({
    ruleDefinition: serializeRule(automataStore.rule),
    dimension: automataStore.dimension,
    neighborhoodRadius: automataStore.neighborhoodRadius,
    latticeType: automataStore.lattice,
    cellStates: { states: automataStore.cellStates, trail: automataStore.trailConfig },
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
  let lastConfigKey = '';

  function syncHistoryFlags(overrides?: { liked?: boolean; bookmarked?: boolean; claimed?: boolean }) {
    const rd = serializeRule(automataStore.rule);
    const dim = automataStore.dimension;
    const nr = automataStore.neighborhoodRadius;
    historyStore.updateFlags(rd, dim, nr, {
      liked: overrides?.liked ?? discoveryInfo?.isLikedByMe ?? false,
      bookmarked: overrides?.bookmarked ?? discoveryInfo?.isBookmarkedByMe ?? false,
      ...(overrides?.claimed !== undefined ? { claimed: overrides.claimed } : {}),
    });
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

</script>

{#if compact}
<div class="desc-root desc-compact">
  <div class="compact-title-row">
    <h1 class="title" title={title}>{title}</h1>
    <div class="action-buttons-col">
      <ActionButtons
        loading={discoveryInfo === null}
        entityType={discoveryInfo?.entityType ?? ''}
        entityId={discoveryInfo?.entityId ?? ''}
        isLikedByMe={discoveryInfo?.isLikedByMe ?? false}
        isBookmarkedByMe={discoveryInfo?.isBookmarkedByMe ?? false}
        likeCount={discoveryInfo?.totalLikes ?? 0}
        bookmarkCount={discoveryInfo?.totalBookmarks ?? 0}
        copyUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </div>
  </div>
  <div class="compact-row">
    <div class="badge-col">
      <MinerBadge />
    </div>
    <div class="content-col">
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
  </div>
</div>
{:else}
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
  <div class="action-buttons-col">
    <ActionButtons
      loading={discoveryInfo === null}
      entityType={discoveryInfo?.entityType ?? ''}
      entityId={discoveryInfo?.entityId ?? ''}
      isLikedByMe={discoveryInfo?.isLikedByMe ?? false}
      isBookmarkedByMe={discoveryInfo?.isBookmarkedByMe ?? false}
      likeCount={discoveryInfo?.totalLikes ?? 0}
      bookmarkCount={discoveryInfo?.totalBookmarks ?? 0}
      copyUrl={typeof window !== 'undefined' ? window.location.href : ''}
    />
  </div>
</div>
{/if}

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

  .action-buttons-col {
    flex-shrink: 0;
    padding-top: 4px;
  }

  .desc-compact {
    flex-direction: column;
    gap: 16px;
  }

  .desc-compact .title {
    margin-bottom: 0;
  }

  .compact-title-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .compact-title-row .title {
    flex: 1;
    min-width: 0;
  }

  .compact-title-row .action-buttons-col {
    padding-top: 0;
  }

  .compact-row {
    display: flex;
    gap: 24px;
  }
</style>
