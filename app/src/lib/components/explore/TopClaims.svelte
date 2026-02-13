<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import CompactCard from '../CompactCard.svelte';
  import SkeletonCard from '../SkeletonCard.svelte';
  import RankBadge from './RankBadge.svelte';

  let { onload, dense = false }: { onload?: (item: any) => void; dense?: boolean } = $props();

  const ROWS_PER_PAGE = 2;
  const COLS = 2;
  const PAGE_SIZE = ROWS_PER_PAGE * COLS;

  let items: any[] = $state([]);
  let loading = $state(true);
  let visibleCount = $state(PAGE_SIZE);
  let totalFetched = $state(0);

  async function fetchTopClaims() {
    loading = true;
    try {
      const result = await api<{ items: any[]; hasMore: boolean }>('GET', `/api/explore?sort=most_liked&limit=20&offset=0`);
      items = result.items;
      totalFetched = items.length;
    } catch {
      items = [];
    } finally {
      loading = false;
    }
  }

  function showMore() {
    visibleCount += PAGE_SIZE;
  }

  let visibleItems = $derived(items.slice(0, visibleCount));
  let canShowMore = $derived(visibleCount < items.length);

  onMount(fetchTopClaims);
</script>

<div class="top-claims-section">
  <div class="section-header">
    <span class="section-label">Top Claims</span>
  </div>

  {#if loading && items.length === 0}
    <div class="claims-grid">
      {#each { length: PAGE_SIZE } as _}
        <SkeletonCard />
      {/each}
    </div>
  {:else if items.length === 0}
    <div class="empty">No claims yet</div>
  {:else}
    <div class="claims-grid">
      {#each visibleItems as item, i (item.id)}
        <div class="claim-wrapper">
          <div class="rank-badge-wrap">
            <RankBadge rank={i + 1} />
          </div>
          <CompactCard {item} onclick={onload} interactive {dense} />
        </div>
      {/each}
    </div>

    {#if canShowMore}
      <button class="show-more" onclick={showMore}>
        Show More
      </button>
    {/if}
  {/if}
</div>

<style>
  .top-claims-section {
    margin-bottom: 16px;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
  }

  .claims-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .claim-wrapper {
    position: relative;
  }

  .rank-badge-wrap {
    position: absolute;
    top: -6px;
    left: -6px;
    z-index: 10;
    pointer-events: none;
  }

  .empty {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #78716c;
    text-align: center;
    padding: 40px 0;
  }

  .show-more {
    display: block;
    margin: 20px auto 0;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a8a29e;
    background: #1c1917;
    border: 2px solid #44403c;
    border-radius: 8px;
    padding: 8px 24px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .show-more:hover {
    background: #292524;
    color: #facc15;
    border-color: #facc15;
  }
</style>
