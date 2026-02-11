<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  let editingState: number | null = $state(null);

  function hslString(color: { h: number; s: number; l: number; a: number }): string {
    return `hsla(${Math.floor(color.h)}, ${Math.floor(color.s * 100)}%, ${Math.floor(color.l * 100)}%, ${color.a})`;
  }

  function toggleColorEditor(stateNum: number) {
    editingState = editingState === stateNum ? null : stateNum;
  }
</script>

<div style="width: 300px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Cell States
  </div>

  <!-- Key header -->
  <div class="mb-4 flex w-[200px] justify-between">
    <div
      class="flex w-full justify-center border-b border-gray-500 px-5 py-1 text-center text-xs text-white"
      style="letter-spacing: 3px;"
    >
      #
    </div>
    <div
      class="flex w-full justify-center border-b border-gray-500 px-5 py-1 text-center text-xs text-white"
      style="letter-spacing: 3px;"
    >
      Color
    </div>
  </div>

  <!-- State rows -->
  <div class="flex w-[200px] flex-col">
    {#each automataStore.cellStates as cellState}
      <div class="flex h-10 w-[200px] items-center justify-evenly">
        <div class="flex h-[30px] w-full items-center justify-center p-1 text-white" style="margin-left: 10px; margin-right: 20px;">
          {cellState.number}
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="flex w-full cursor-pointer justify-center p-1"
          style="margin-left: 20px; margin-right: 20px; margin-bottom: 10px;"
          onclick={() => toggleColorEditor(cellState.number)}
        >
          <div
            class="mr-1 h-[30px] w-[30px] border border-white"
            style="background-color: {hslString(cellState.color)};"
          ></div>
        </div>
      </div>

      {#if editingState === cellState.number}
        <div class="mb-3 flex flex-col gap-2 px-2">
          <label class="flex items-center gap-2 text-xs text-white">
            H
            <input
              type="range"
              min="0"
              max="360"
              value={cellState.color.h}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.number, {
                  ...cellState.color,
                  h: parseInt((e.target as HTMLInputElement).value),
                });
              }}
              class="w-full"
            />
          </label>
          <label class="flex items-center gap-2 text-xs text-white">
            S
            <input
              type="range"
              min="0"
              max="100"
              value={Math.floor(cellState.color.s * 100)}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.number, {
                  ...cellState.color,
                  s: parseInt((e.target as HTMLInputElement).value) / 100,
                });
              }}
              class="w-full"
            />
          </label>
          <label class="flex items-center gap-2 text-xs text-white">
            L
            <input
              type="range"
              min="0"
              max="100"
              value={Math.floor(cellState.color.l * 100)}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.number, {
                  ...cellState.color,
                  l: parseInt((e.target as HTMLInputElement).value) / 100,
                });
              }}
              class="w-full"
            />
          </label>
        </div>
      {/if}
    {/each}
  </div>
</div>
