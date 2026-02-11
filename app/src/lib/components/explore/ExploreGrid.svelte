<script lang="ts">
  import ExploreCard from './ExploreCard.svelte';

  let {
    items = [],
    onload
  }: {
    items: any[];
    onload?: (item: any) => void;
  } = $props();
</script>

{#if items.length === 0}
  <div class="flex h-40 items-center justify-center">
    <p class="text-neutral-400">No items yet</p>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each items as item (item.id)}
      <ExploreCard {item} {onload} />
    {/each}
  </div>
{/if}
