<script lang="ts">
  import { onMount } from 'svelte';
  import CompactCard from '../CompactCard.svelte';
  import SkeletonCard from '../SkeletonCard.svelte';

  let {
    items = [],
    loading = false,
    hasMore = false,
    onload,
    onloadmore
  }: {
    items: any[];
    loading?: boolean;
    hasMore?: boolean;
    onload?: (item: any) => void;
    onloadmore?: () => void;
  } = $props();

  let endEl = $state<HTMLElement>();

  // Poll-based infinite scroll: check every 200ms if the end marker is near the viewport.
  // This avoids all issues with scroll event listeners, IntersectionObserver roots, and
  // nested scroll containers. The parent's loadMore() guards against double-fetches.
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
  <div class="flex h-40 items-center justify-center">
    <p class="text-neutral-400">No items yet</p>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {#each items as item (item.id)}
      <CompactCard {item} onclick={onload} interactive />
    {/each}

    {#if loading}
      {#each { length: 6 } as _}
        <SkeletonCard />
      {/each}
    {/if}
  </div>

  <div bind:this={endEl} class="h-1"></div>

  {#if hasMore && !loading}
    <button
      class="mx-auto mt-6 block rounded-lg bg-neutral-100 px-6 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-200"
      onclick={() => onloadmore?.()}
    >
      Load more
    </button>
  {/if}
{/if}
