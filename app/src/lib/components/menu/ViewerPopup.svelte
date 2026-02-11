<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import PopupButton from './PopupButton.svelte';

  const availableViews: number[][] = [
    [2],      // 1D: only 2D viewer
    [2, 3],   // 2D: 2D or 3D viewer
    [3],      // 3D: only 3D viewer
  ];

  let views = $derived(availableViews[automataStore.dimension - 1]);
</script>

<div style="height: 150px; width: 270px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Dimensions To View Cells In
  </div>
  <div class="flex w-4/5 justify-center">
    {#each views as viewDim}
      <PopupButton
        isActive={viewDim === automataStore.viewer}
        onclick={() => automataStore.setViewer(viewDim as 2 | 3)}
      >
        {viewDim}D
      </PopupButton>
    {/each}
  </div>
</div>
