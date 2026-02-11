<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let radius = $derived(automataStore.neighborhoodRadius);
  let neighborCount = $derived(automataStore.neighbors.length);
  let is1DWolfram = $derived(automataStore.dimension === 1 && radius > 1);
</script>

<div style="width: 270px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Neighborhood Radius
  </div>

  <div class="flex w-4/5 items-center justify-center gap-3 py-3">
    <button
      class="flex h-8 w-8 items-center justify-center rounded border border-neutral-300 text-lg hover:bg-neutral-100 disabled:opacity-30"
      disabled={radius <= 1}
      onclick={() => automataStore.setNeighborhoodRadius(radius - 1)}
    >
      -
    </button>
    <span class="w-8 text-center text-lg font-medium">{radius}</span>
    <button
      class="flex h-8 w-8 items-center justify-center rounded border border-neutral-300 text-lg hover:bg-neutral-100 disabled:opacity-30"
      disabled={radius >= 10}
      onclick={() => automataStore.setNeighborhoodRadius(radius + 1)}
    >
      +
    </button>
  </div>
  <div class="pb-2 text-center text-xs text-neutral-500">
    {neighborCount} neighbors (r={radius})
  </div>
  {#if is1DWolfram}
    <div class="px-4 pb-2 text-center text-[10px] text-neutral-400">
      Uses life-like rules (r>1 incompatible with Wolfram)
    </div>
  {/if}
</div>
