<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { latticesForDimension } from '$lib-core';
  import PopupButton from './PopupButton.svelte';

  let lattices = $derived(
    automataStore.dimension >= 2
      ? latticesForDimension(automataStore.dimension as 2 | 3)
      : []
  );
</script>

{#if lattices.length > 1}
  <div style="width: 270px;" class="flex flex-col items-center justify-center pb-3">
    <div
      class="text-center"
      style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
    >
      Lattice Type
    </div>
    <div class="flex w-4/5 flex-wrap justify-center">
      {#each lattices as lattice}
        <PopupButton
          isActive={automataStore.lattice === lattice.type}
          onclick={() => automataStore.setLattice(lattice.type)}
        >
          {lattice.label}
        </PopupButton>
      {/each}
    </div>
  </div>
{/if}
