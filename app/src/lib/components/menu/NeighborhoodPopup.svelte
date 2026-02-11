<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let is1D = $derived(automataStore.dimension === 1);
  let radius = $derived(automataStore.neighborhoodRadius);
  let neighborCount = $derived(automataStore.neighbors.length);
</script>

<div style="width: 270px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Neighborhood Radius
  </div>

  {#if is1D}
    <div class="px-4 py-3 text-center text-sm text-neutral-400">
      1D Wolfram rules use fixed radius 1
    </div>
  {:else}
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
      {neighborCount} neighbors (Moore r={radius})
    </div>
  {/if}
</div>
