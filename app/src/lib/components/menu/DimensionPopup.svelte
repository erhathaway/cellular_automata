<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import PopupButton from './PopupButton.svelte';
</script>

<div style="height: 150px; width: 270px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Cell Population Dimensions
  </div>
  <div class="flex w-4/5 justify-center">
    <PopupButton
      isActive={automataStore.dimension === 1}
      onclick={() => automataStore.setDimension(1)}
    >
      1D
    </PopupButton>
    <PopupButton
      isActive={automataStore.dimension === 2}
      onclick={() => automataStore.setDimension(2)}
    >
      2D
    </PopupButton>
    <PopupButton
      isActive={automataStore.dimension === 3}
      onclick={() => automataStore.setDimension(3)}
    >
      3D
    </PopupButton>
  </div>
</div>
