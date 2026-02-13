<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { discoveryStore } from '$lib/stores/discovery.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import { getLattice } from '$lib-core';
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

  // Use shared discovery store
  let discoveryInfo = $derived(discoveryStore.discoveryInfo);

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
  <div class="compact-details-row">
    <AutomataDetails item={detailsItem} hideOwner {fullRules} />
  </div>
</div>
{:else}
<div class="desc-root">
  <!-- Left column: Title + Details -->
  <div class="content-col">
    <h1 class="title" title={title}>{title}</h1>
    <AutomataDetails item={detailsItem} hideOwner {fullRules} />
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
    padding: 120px 24px 40px;
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

  .action-buttons-col {
    flex-shrink: 0;
    padding-top: 4px;
  }

  .desc-compact {
    flex-direction: column;
    gap: 16px;
    padding-top: 40px;
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
    padding-top: 12px;
    margin-right: 24px;
  }

  .compact-details-row {
    display: flex;
    justify-content: center;
  }

</style>
