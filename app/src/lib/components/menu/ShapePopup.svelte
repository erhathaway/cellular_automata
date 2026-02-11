<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let keys = $derived(Object.keys(automataStore.populationShape));
</script>

<div
  style="height: {110 + keys.length * 40}px; width: 300px;"
  class="flex flex-col items-center justify-center"
>
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Population Size Per Dimension
  </div>
  {#each keys as dimName}
    <div class="mb-2.5 flex w-4/5 justify-center">
      <div class="flex h-[30px] items-end" style="width: 20px; margin-right: 20px; color: white; flex-grow: 1;">
        {dimName}
      </div>
      <input
        type="number"
        value={automataStore.populationShape[dimName]}
        onchange={(e) => {
          const v = parseInt((e.target as HTMLInputElement).value);
          if (!isNaN(v) && v > 0) {
            automataStore.setPopulationShapeDimension(dimName, v);
          }
        }}
        class="h-[30px] border-b border-gray-500 bg-transparent text-white outline-none"
        style="border-top: none; border-left: none; border-right: none; letter-spacing: 3px; flex-grow: 2;"
      />
    </div>
  {/each}
</div>
