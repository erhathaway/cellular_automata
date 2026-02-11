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

  function findScrollParent(el: HTMLElement): HTMLElement | null {
    let node = el.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY)) return node;
      node = node.parentElement;
    }
    return null;
  }

  // Intersection observer for infinite scroll
  // The parent's loadMore() guards against double-fetches,
  // so we just fire onloadmore whenever the sentinel is visible.
  $effect(() => {
    if (!sentinelEl || !onloadmore) return;
    const cb = onloadmore;
    const scrollRoot = findScrollParent(sentinelEl);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          cb();
        }
      },
      { root: scrollRoot, rootMargin: '400px' }
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
