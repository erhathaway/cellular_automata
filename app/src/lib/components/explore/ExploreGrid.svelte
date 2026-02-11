<script lang="ts">
  import CompactCard from '../CompactCard.svelte';

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
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {#each items as item (item.id)}
      <CompactCard {item} onclick={onload} interactive />
    {/each}
  </div>
{/if}
