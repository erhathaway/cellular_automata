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
  let scrollParent: HTMLElement | null = null;

  function getScrollParent(el: HTMLElement): HTMLElement {
    let node = el.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY)) return node;
      node = node.parentElement;
    }
    return document.documentElement;
  }

  function checkNearBottom() {
    if (!scrollParent || !onloadmore) return;
    const el = scrollParent;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 600;
    if (nearBottom) {
      onloadmore();
    }
  }

  // Set up scroll listener once container is available
  $effect(() => {
    if (!containerEl) return;
    scrollParent = getScrollParent(containerEl);

    scrollParent.addEventListener('scroll', checkNearBottom, { passive: true });
    return () => {
      scrollParent?.removeEventListener('scroll', checkNearBottom);
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
