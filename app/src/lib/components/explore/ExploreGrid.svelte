<script lang="ts">
  import { tick } from 'svelte';
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

  let containerEl = $state<HTMLElement>();

  function checkNearBottom() {
    if (!containerEl || !onloadmore) return;
    const rect = containerEl.getBoundingClientRect();
    // If the bottom of our content is within 800px of the viewport bottom, load more
    if (rect.bottom < window.innerHeight + 800) {
      onloadmore();
    }
  }

  // Listen for ANY scroll event (capture phase catches scrolls on all elements)
  $effect(() => {
    if (!containerEl) return;

    document.addEventListener('scroll', checkNearBottom, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', checkNearBottom, { capture: true });
    };
  });

  // Re-check after loading finishes — content may not fill the viewport
  $effect(() => {
    if (!loading && hasMore && items.length > 0) {
      tick().then(checkNearBottom);
    }
  });
</script>

<div bind:this={containerEl}>
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
  {/if}
</div>
