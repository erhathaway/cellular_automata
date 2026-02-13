<script lang="ts">
  import { onMount } from 'svelte';
  import CompactCard from '../CompactCard.svelte';
  import SkeletonCard from '../SkeletonCard.svelte';

  let {
    items = [],
    loading = false,
    hasMore = false,
    currentUserId = '',
    onload,
    onloadmore
  }: {
    items: any[];
    loading?: boolean;
    hasMore?: boolean;
    currentUserId?: string;
    onload?: (item: any) => void;
    onloadmore?: () => void;
  } = $props();

  let endEl = $state<HTMLElement>();

  onMount(() => {
    const id = setInterval(() => {
      if (!endEl || !onloadmore || loading || !hasMore) return;
      const rect = endEl.getBoundingClientRect();
      if (rect.top < window.innerHeight + 800) {
        onloadmore();
      }
    }, 200);
    return () => clearInterval(id);
  });
</script>

{#if items.length === 0 && !loading}
  <div class="empty-state">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
      <polyline points="2 15.5 12 8.5 22 15.5" />
      <line x1="12" y1="2" x2="12" y2="8.5" />
    </svg>
    <p class="empty-text">No items yet</p>
  </div>
{:else}
  <div class="grid grid-cols-2 gap-6">
    {#each items as item (item.id)}
      <CompactCard {item} onclick={onload} interactive {currentUserId} />
    {/each}

    {#if loading}
      {#each { length: 6 } as _}
        <SkeletonCard />
      {/each}
    {/if}
  </div>

  <div bind:this={endEl} class="h-1"></div>

  {#if hasMore && !loading}
    <button class="load-more" onclick={() => onloadmore?.()}>
      Load more
    </button>
  {/if}
{/if}

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 160px;
    color: #d6d3d1;
  }

  .empty-text {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #a8a29e;
    letter-spacing: 0.06em;
    margin: 0;
  }

  .load-more {
    display: block;
    margin: 24px auto 0;
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

  .load-more:hover {
    background: #292524;
    color: #facc15;
    border-color: #facc15;
  }
</style>
