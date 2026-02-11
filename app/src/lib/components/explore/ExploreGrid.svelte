<script lang="ts">
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

  let sentinelEl = $state<HTMLElement>();

  // Intersection observer for infinite scroll
  $effect(() => {
    if (!sentinelEl || !onloadmore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onloadmore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
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

  {#if hasMore && !loading}
    <div bind:this={sentinelEl} class="h-1"></div>
  {/if}
{/if}
